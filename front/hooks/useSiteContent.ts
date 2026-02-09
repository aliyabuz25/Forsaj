import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

interface ContentSection {
    id: string;
    type: 'text' | 'image';
    label: string;
    value: string;
}

interface ImageSection {
    id: string;
    path: string;
    alt: string;
    type: 'local' | 'remote';
}

interface PageContent {
    id: string;
    title: string;
    sections: ContentSection[];
    images: ImageSection[];
}

export const useSiteContent = (scopePageId?: string) => {
    const [content, setContent] = useState<PageContent[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadContent = async () => {
            try {
                const { data, error } = await supabase
                    .from('site_content')
                    .select('*');

                if (error) throw error;

                if (data) {
                    const mapped = data.map((p: any) => ({
                        id: p.page_id,
                        title: p.title,
                        sections: p.sections,
                        images: p.images
                    }));
                    setContent(mapped as any);
                }
            } catch (err) {
                console.error('Failed to load site content from Supabase:', err);
            } finally {
                setIsLoading(false);
            }
        };

        loadContent();
    }, []);

    const getPage = (id: string) => {
        // This function assumes 'content' is PageContent[], which might be incorrect after the change
        return (content as PageContent[]).find(p => p.id === id.toLowerCase());
    };

    const getText = (arg1: string, arg2?: string | number, arg3: string = '') => {
        let pageId: string | undefined;
        let sectionIdOrIndex: string | number;
        let defaultValue: string;

        if (scopePageId) {
            // Usage: getText(key, default)
            pageId = scopePageId;
            sectionIdOrIndex = arg1;
            defaultValue = (typeof arg2 === 'string' ? arg2 : '') || '';
        } else {
            // Usage: getText(pageId, key, default)
            pageId = arg1;
            sectionIdOrIndex = arg2 as string | number;
            defaultValue = arg3;
        }

        if (!pageId) return defaultValue;

        const page = getPage(pageId);
        if (!page) return defaultValue;

        const section = typeof sectionIdOrIndex === 'number'
            ? page.sections[sectionIdOrIndex]
            : page.sections.find(s => s.id === sectionIdOrIndex);

        return section ? section.value : defaultValue;
    };

    const getImage = (arg1: string, arg2?: string | number, arg3: string = '') => {
        let pageId: string | undefined;
        let imageIdOrIndex: string | number;
        let defaultPath: string;

        if (scopePageId) {
            pageId = scopePageId;
            imageIdOrIndex = arg1;
            defaultPath = (typeof arg2 === 'string' ? arg2 : '') || '';
        } else {
            pageId = arg1;
            imageIdOrIndex = arg2 as string | number;
            defaultPath = arg3;
        }

        if (!pageId) return { path: defaultPath, alt: '' };

        const page = getPage(pageId);
        if (!page) return { path: defaultPath, alt: '' };

        const image = typeof imageIdOrIndex === 'number'
            ? page.images[imageIdOrIndex]
            : page.images.find(img => img.id === imageIdOrIndex);

        return image ? { path: image.path, alt: image.alt } : { path: defaultPath, alt: '' };
    };

    return { content, isLoading, getPage, getText, getImage };
};
