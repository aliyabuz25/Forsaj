import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Save, Type, Image as ImageIcon, Layout, Globe, Plus, Trash2, X, Search, Calendar, MapPin, FileText, Trophy, RotateCcw, Video, Play } from 'lucide-react';
import toast from 'react-hot-toast';
import './VisualEditor.css';

interface Section {
    id: string;
    type: 'text' | 'image';
    label: string;
    value: string;
}

interface PageImage {
    id: string;
    path: string;
    alt: string;
    type: 'local' | 'remote';
}

interface PageContent {
    id: string;
    title: string;
    active?: boolean;
    sections: Section[];
    images: PageImage[];
}

interface EventItem {
    id: number;
    title: string;
    date: string;
    location: string;
    category: string;
    img: string;
    description: string;
    rules: string;
    pdfUrl?: string;
    status: 'planned' | 'past';
}

interface NewsItem {
    id: number;
    title: string;
    date: string;
    img: string;
    description: string;
    category?: string;
    status: 'published' | 'draft';
}

interface DriverItem {
    id: number;
    rank: number;
    name: string;
    license: string;
    team: string;
    wins: number;
    points: number;
    img: string;
}

interface VideoItem {
    id: number;
    title: string;
    youtubeUrl: string;
    videoId: string;
    duration: string;
    thumbnail: string;
}

interface GalleryPhotoItem {
    id: number;
    title: string;
    url: string;
}

interface DriverCategory {
    id: string;
    name: string;
    drivers: DriverItem[];
}

const BBCodeEditor: React.FC<{ value: string, onChange: (val: string) => void, id: string }> = ({ value, onChange, id }) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const editorRef = React.useRef<any>(null);
    const onChangeRef = React.useRef(onChange);

    // Keep onChangeRef up to date
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        const initEditor = () => {
            if (textareaRef.current && (window as any).sceditor) {
                (window as any).sceditor.create(textareaRef.current, {
                    format: 'bbcode',
                    style: 'https://cdn.jsdelivr.net/npm/sceditor@3/minified/themes/content/default.min.css',
                    toolbar: 'bold,italic,underline,strike|left,center,right,justify|font,size,color,removeformat|cut,copy,paste,pastetext|bulletlist,orderedlist|code,quote|horizontalrule,image,email,link,unlink|emoticon,youtube,date,time|print,source',
                    width: '100%',
                    height: 300,
                });
                editorRef.current = (window as any).sceditor.instance(textareaRef.current);

                // Proper way to bind events in SCEditor
                editorRef.current.bind('blur', () => {
                    onChangeRef.current(editorRef.current.val());
                });

                // Set initial value
                editorRef.current.val(value);
            } else if (!(window as any).sceditor) {
                // Retry in a bit if not yet loaded
                setTimeout(initEditor, 500);
            }
        };

        initEditor();

        return () => {
            if (editorRef.current) {
                editorRef.current.destroy();
            }
        };
    }, []);

    // Update editor value if it changes from outside
    useEffect(() => {
        const currentVal = editorRef.current?.val();
        if (editorRef.current && currentVal !== value && typeof value === 'string') {
            editorRef.current.val(value);
        }
    }, [value]);

    return (
        <textarea ref={textareaRef} id={id} style={{ visibility: 'hidden' }} />
    );
};

const VisualEditor: React.FC = () => {
    const [pages, setPages] = useState<PageContent[]>([]);
    const [selectedPageIndex, setSelectedPageIndex] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [extractStep, setExtractStep] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false);
    const [isAddingNewFromSystem, setIsAddingNewFromSystem] = useState(false);
    const [allAvailableImages, setAllAvailableImages] = useState<string[]>([]);
    const [activeImageField, setActiveImageField] = useState<{ pageIdx: number, imgId: string } | null>(null);
    const [newSectionTitle, setNewSectionTitle] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const [events, setEvents] = useState<EventItem[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const [eventForm, setEventForm] = useState<Partial<EventItem>>({});

    // News Mode State
    const [news, setNews] = useState<NewsItem[]>([]);
    const [selectedNewsId, setSelectedNewsId] = useState<number | null>(null);
    const [newsForm, setNewsForm] = useState<Partial<NewsItem>>({});

    // Video Mode State
    const [videos, setVideos] = useState<VideoItem[]>([]);
    const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);
    const [videoForm, setVideoForm] = useState<Partial<VideoItem>>({});

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const mode = queryParams.get('mode'); // 'extract', 'events', 'news', 'drivers', 'videos', 'photos'
    const pageParam = queryParams.get('page');

    const [editorMode, setEditorMode] = useState<'extract' | 'events' | 'news' | 'drivers' | 'videos' | 'photos'>('extract');

    const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhotoItem[]>([]);
    const [selectedPhotoId, setSelectedPhotoId] = useState<number | null>(null);
    const [photoForm, setPhotoForm] = useState<Partial<GalleryPhotoItem>>({});

    useEffect(() => {
        if (mode) {
            setEditorMode(mode as any);
        } else if (pageParam) {
            setEditorMode('extract');
        } else {
            setEditorMode('extract');
        }
    }, [mode, pageParam]);
    const [driverCategories, setDriverCategories] = useState<DriverCategory[]>([]);
    const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
    const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
    const [driverForm, setDriverForm] = useState<Partial<DriverItem>>({});

    const loadContent = async () => {
        try {
            // 1. Load Site Content
            const resContent = await fetch('/api/site-content');
            const contentData = await resContent.json();
            if (Array.isArray(contentData)) {
                setPages(contentData);
            }

            // 2. Load Available Images (Keep legacy API for local scan)
            fetch(`/api/all-images?v=${Date.now()}`)
                .then(res => res.json())
                .then(data => { if (data.local) setAllAvailableImages(data.local); });

            // 3. Load Events
            const resEvents = await fetch('/api/events');
            const eventsData = await resEvents.json();
            if (Array.isArray(eventsData)) {
                setEvents(eventsData);
                if (eventsData.length > 0 && selectedEventId === null) {
                    setSelectedEventId(eventsData[0].id);
                    setEventForm(eventsData[0]);
                }
            }

            // 4. Load News
            const resNews = await fetch('/api/news');
            const newsData = await resNews.json();
            if (Array.isArray(newsData)) {
                setNews(newsData);
                if (newsData.length > 0 && selectedNewsId === null) {
                    handleNewsSelect(newsData[0].id);
                }
            }

            // 5. Load Drivers
            const resDrivers = await fetch('/api/drivers');
            const driversData = await resDrivers.json();
            if (Array.isArray(driversData)) {
                setDriverCategories(driversData);
                if (driversData.length > 0 && selectedCatId === null) {
                    setSelectedCatId(driversData[0].id);
                }
            }

            // 6. Load Gallery Photos
            const resPhotos = await fetch('/api/gallery-photos');
            const photosData = await resPhotos.json();
            if (Array.isArray(photosData)) setGalleryPhotos(photosData);

            // 7. Load Videos
            const resVideos = await fetch('/api/videos');
            const videosData = await resVideos.json();
            if (Array.isArray(videosData)) {
                setVideos(videosData);
                if (videosData.length > 0 && selectedVideoId === null) {
                    handleVideoSelect(videosData[0].id);
                }
            }
        } catch (err) {
            console.error('Content load error:', err);
        }
    };

    useEffect(() => {
        loadContent();

        // Auto-extract if it's the first time and we have no pages
        const hasExtracted = localStorage.getItem('octo_extracted');
        if (!hasExtracted && pages.length === 0 && !isExtracting) {
            // We wait a bit to make sure pages are truly empty (fetch finished)
            setTimeout(() => {
                if (pages.length === 0) startExtraction();
            }, 1000);
        }
    }, [pages.length]); // Removed editorMode from deps to avoid loop if we sync params

    // Sync URL params to state
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const modeParam = queryParams.get('mode');
        const pageParam = queryParams.get('page');

        if (modeParam && ['extract', 'events', 'news', 'drivers', 'videos'].includes(modeParam)) {
            setEditorMode(modeParam as any);
        } else if (pageParam) {
            setEditorMode('extract');
            const idx = pages.findIndex(p => p.id === pageParam);
            if (idx !== -1) setSelectedPageIndex(idx);
        }
    }, [location.search, pages]);

    const startExtraction = async () => {
        setIsExtracting(true);
        setExtractStep('Front-end komponentləri skan edilir...');
        setProgress(30);

        const startTime = Date.now();
        const toastId = toast.loading('Sinxronizasiya başladı...');

        try {
            const response = await fetch('/api/extract-content', { method: 'POST' });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText || 'Extraction failed');
            }

            setProgress(60);
            setExtractStep('Bulud bazası ilə sinxronizasiya edilir...');

            const data = await response.json();
            const extractedPages = data.pages || data;

            // Sync with JSON storage
            await fetch('/api/save-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(extractedPages)
            });

            setProgress(90);
            setPages(extractedPages);

            // Artificial delay for UX
            const elapsed = Date.now() - startTime;
            if (elapsed < 800) await new Promise(r => setTimeout(r, 800 - elapsed));

            setProgress(100);
            setExtractStep('Tamamlandı!');

            setTimeout(() => {
                setIsExtracting(false);
                localStorage.setItem('octo_extracted', 'true');
                toast.success('Sinxronizasiya tamamlandı! Baza yeniləndi.', { id: toastId });
                setTimeout(() => window.location.reload(), 1500);
            }, 500);

        } catch (error: any) {
            console.error('Extraction error:', error);
            setIsExtracting(false);
            toast.error(`Sinxronizasiya xətası: ${error.message}`, { id: toastId });
        }
    };

    const handleSectionChange = (pageIdx: number, sectionId: string, field: 'value' | 'label', value: string) => {
        const newPages = [...pages];
        const sectionIdx = newPages[pageIdx].sections.findIndex(s => s.id === sectionId);
        if (sectionIdx !== -1) {
            newPages[pageIdx].sections[sectionIdx][field] = value;
            setPages(newPages);
        }
    };

    const handleImageAltChange = (pageIdx: number, imgId: string, alt: string) => {
        const newPages = [...pages];
        const imgIdx = newPages[pageIdx].images.findIndex(i => i.id === imgId);
        if (imgIdx !== -1) {
            newPages[pageIdx].images[imgIdx].alt = alt;
            setPages(newPages);
        }
    };

    const addNewSection = () => {
        if (!newSectionTitle.trim()) {
            toast.error('Başlıq daxil edin!');
            return;
        }

        const newId = newSectionTitle.toLowerCase().replace(/\s+/g, '-');
        const newPage: PageContent = {
            id: newId,
            title: newSectionTitle,
            sections: [
                { id: `text-0`, type: 'text', label: 'Bölmə', value: 'Yeni bölmə məzmunu...' }
            ],
            images: [],
        };

        setPages([...pages, newPage]);
        setSelectedPageIndex(pages.length);
        setIsModalOpen(false);
        setNewSectionTitle('');
        toast.success('Yeni bölmə əlavə edildi!');
    };

    const deleteSection = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Bu bölməni silmək istədiyinizə əminsiniz?')) {
            const newPages = pages.filter((_, i) => i !== index);
            setPages(newPages);
            if (selectedPageIndex >= newPages.length) {
                setSelectedPageIndex(Math.max(0, newPages.length - 1));
            }
            toast.success('Bölmə silindi');
        }
    };

    const addField = (type: 'text' | 'image') => {
        const newPages = [...pages];
        const currentPage = newPages[selectedPageIndex];

        if (type === 'text') {
            const newId = `text-${currentPage.sections.length}`;
            currentPage.sections.push({ id: newId, type: 'text', label: 'Bölmə', value: 'Yeni mətn sahəsi...' });
            toast.success('Yeni mətn sahəsi əlavə edildi');
        } else {
            const newId = `img-${currentPage.images.length}`;
            currentPage.images.push({ id: newId, path: '', alt: '', type: 'local' });
            toast.success('Yeni şəkil sahəsi əlavə edildi');
        }

        setPages(newPages);
    };

    const removeField = (type: 'text' | 'image', fieldId: string) => {
        const newPages = [...pages];
        const currentPage = newPages[selectedPageIndex];

        if (type === 'text') {
            currentPage.sections = currentPage.sections.filter(s => s.id !== fieldId);
        } else {
            currentPage.images = currentPage.images.filter(img => img.id !== fieldId);
        }

        setPages(newPages);
        toast.success('Sahə silindi');
    };

    const openImageSelector = (pageIdx: number, imgId: string) => {
        setActiveImageField({ pageIdx, imgId });
        setIsImageSelectorOpen(true);
    };

    const uploadImage = async (file: File): Promise<string | null> => {
        const formData = new FormData();
        formData.append('image', file);
        const uploadId = toast.loading('Şəkil yüklənir...');
        try {
            const response = await fetch('/api/upload-image', { method: 'POST', body: formData });
            if (response.ok) {
                const data = await response.json();
                toast.success('Şəkil uğurla yükləndi', { id: uploadId });
                return data.url;
            } else {
                throw new Error('Upload fail');
            }
        } catch (err) {
            console.error('Upload error:', err);
            toast.error('Görsəl yüklənərkən xəta baş verdi', { id: uploadId });
            return null;
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, pageIdx: number, imgId: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const url = await uploadImage(file);
        if (url) {
            const newPages = [...pages];
            const imgIdx = newPages[pageIdx].images.findIndex(i => i.id === imgId);
            if (imgIdx !== -1) {
                newPages[pageIdx].images[imgIdx].path = url;
                newPages[pageIdx].images[imgIdx].type = 'local';
                setPages(newPages);
            }
        }
    };

    const selectImage = (path: string) => {
        if (!activeImageField) return;

        const newPages = [...pages];
        if (isAddingNewFromSystem) {
            // Add a new field instead of replacing
            const newId = `img-${newPages[activeImageField.pageIdx].images.length}-${Date.now()}`;
            newPages[activeImageField.pageIdx].images.push({
                id: newId,
                path: path,
                alt: 'Daxil edildi',
                type: 'local'
            });
            setIsAddingNewFromSystem(false);
        } else {
            const imgIdx = newPages[activeImageField.pageIdx].images.findIndex(i => i.id === activeImageField.imgId);
            if (imgIdx !== -1) {
                newPages[activeImageField.pageIdx].images[imgIdx].path = path;
                newPages[activeImageField.pageIdx].images[imgIdx].type = 'local';
            }
        }

        setPages(newPages);
        setIsImageSelectorOpen(false);
        toast.success('Şəkil seçildi');
    };

    const saveChanges = async () => {
        setIsSaving(true);
        const toastId = toast.loading('Yadda saxlanılır...');
        try {
            if (editorMode === 'extract') {
                await fetch('/api/save-content', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(pages)
                });
            } else if (editorMode === 'events') {
                await fetch('/api/events', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(events)
                });
            } else if (editorMode === 'news') {
                await fetch('/api/news', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(news)
                });
            } else if (editorMode === 'drivers') {
                await fetch('/api/drivers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(driverCategories)
                });
            } else if (editorMode === 'videos') {
                await fetch('/api/videos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(videos)
                });
            } else if (editorMode === 'photos') {
                await fetch('/api/gallery-photos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(galleryPhotos)
                });
            }

            toast.success('Dəyişikliklər bulud bazasına qeyd edildi!', { id: toastId });
            await loadContent();
        } catch (err: any) {
            console.error('Save error:', err);
            toast.error(`Yadda saxlama xətası: ${err.message}`, { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    const handleEventSelect = (id: number) => {
        setSelectedEventId(id);
        const evt = events.find(e => e.id === id);
        if (evt) setEventForm({ ...evt });
    };

    const handleEventChange = (field: keyof EventItem, value: any, targetId?: number) => {
        const activeId = targetId || selectedEventId;

        setEventForm(prev => {
            // Only update local form if the ID matches what we are currently looking at
            // or if it's a field like 'title' that doesn't use targetId
            const isSameEvent = !targetId || targetId === selectedEventId;
            const updatedForm = isSameEvent ? { ...prev, [field]: value } as EventItem : prev;

            // ALWAYS update the master events list using the correct ID
            if (activeId) {
                setEvents(oldEvents => oldEvents.map(e => e.id === activeId ? { ...e, [field]: value } : e));
            }

            return updatedForm;
        });
    };

    const addNewEvent = () => {
        const newId = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;
        const newEvent: EventItem = {
            id: newId,
            title: 'Yeni Tədbir',
            date: new Date().toISOString().split('T')[0],
            location: 'Bakı',
            category: 'OFFROAD',
            img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=2070&auto=format&fit=crop',
            description: '',
            rules: '',
            status: 'planned'
        };
        setEvents([...events, newEvent]);
        setSelectedEventId(newId);
        setEventForm(newEvent);
        toast.success('Yeni tədbir yaradıldı');
    };

    const deleteEvent = async (id: any, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Bu tədbiri silmək istədiyinizə əminsiniz?')) {
            if (typeof id === 'string') {
                // For JSON file, we just save the updated list, so deleting from state is enough
                // But if we wanted to be strict, we'd save immediately. 
                // For now, saveChanges() handles saving the whole list.
            }
            setEvents(events.filter(ev => ev.id !== id));
            if (selectedEventId === id) setSelectedEventId(null);
            toast.success('Tədbir silindi');
        }
    };

    // News Handlers
    const handleNewsSelect = (id: number) => {
        setSelectedNewsId(id);
        const item = news.find(n => n.id === id);
        if (item) setNewsForm({ ...item });
    };

    const handleNewsChange = (field: keyof NewsItem, value: string | number | boolean, targetId?: number) => {
        const activeId = targetId || selectedNewsId;

        setNewsForm(prev => {
            const isSame = !targetId || targetId === selectedNewsId;
            const updatedForm = isSame ? { ...prev, [field]: value } as NewsItem : prev;

            if (activeId) {
                setNews(oldNews => oldNews.map(n => n.id === activeId ? { ...n, [field]: value } : n));
            }

            return updatedForm;
        });
    };

    const addNewNews = () => {
        const newId = news.length > 0 ? Math.max(...news.map(n => n.id)) + 1 : 1;
        const newItem: NewsItem = {
            id: newId,
            title: 'Yeni Xəbər',
            date: new Date().toISOString().split('T')[0],
            img: 'https://images.unsplash.com/photo-1504711432869-53c23e6b47a9?q=80&w=2070&auto=format&fit=crop',
            description: '',
            category: 'BLOQ',
            status: 'draft'
        };
        setNews([...news, newItem]);
        setSelectedNewsId(newId);
        setNewsForm(newItem);
        toast.success('Yeni xəbər yaradıldı');
    };

    // Video Handlers
    const handleVideoSelect = (id: number) => {
        setSelectedVideoId(id);
        const item = videos.find(v => v.id === id);
        if (item) setVideoForm({ ...item });
    };

    const handleVideoChange = (field: keyof VideoItem, value: string, targetId?: number) => {
        const activeId = targetId || selectedVideoId;

        setVideoForm(prev => {
            const isSame = !targetId || targetId === selectedVideoId;
            let updatedForm = isSame ? { ...prev, [field]: value } as VideoItem : prev;

            // Extract YouTube info if URL changes
            if (field === 'youtubeUrl' && isSame) {
                const vId = extractYoutubeId(value);
                if (vId) {
                    updatedForm = {
                        ...updatedForm,
                        videoId: vId,
                        thumbnail: `https://img.youtube.com/vi/${vId}/maxresdefault.jpg`
                    };
                }
            }

            if (activeId) {
                setVideos(old => old.map(v => {
                    if (v.id === activeId) {
                        let updated = { ...v, [field]: value };
                        if (field === 'youtubeUrl') {
                            const vId = extractYoutubeId(value);
                            if (vId) {
                                updated.videoId = vId;
                                updated.thumbnail = `https://img.youtube.com/vi/${vId}/maxresdefault.jpg`;
                            }
                        }
                        return updated;
                    }
                    return v;
                }));
            }

            return updatedForm;
        });
    };

    const extractYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handlePhotoSelect = (id: number) => {
        setSelectedPhotoId(id);
        const item = galleryPhotos.find(p => p.id === id);
        if (item) setPhotoForm({ ...item });
    };

    const addGalleryPhoto = () => {
        const newId = Date.now();
        const newItem: GalleryPhotoItem = {
            id: newId,
            title: 'Yeni Şəkil',
            url: ''
        };
        setGalleryPhotos(prev => [...prev, newItem]);
        handlePhotoSelect(newId);
    };

    const deleteGalleryPhoto = async (id: any, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Bu şəkli silmək istədiyinizə əminsiniz?')) {
            if (typeof id === 'string') {
                // Local state update is sufficient until save
            }
            setGalleryPhotos(prev => prev.filter(p => p.id !== id));
            if (selectedPhotoId === id) {
                setSelectedPhotoId(null);
                setPhotoForm({});
            }
            toast.success('Şəkil silindi');
        }
    };

    const handlePhotoChange = (field: keyof GalleryPhotoItem, value: string) => {
        setPhotoForm(prev => {
            const updatedForm = { ...prev, [field]: value } as GalleryPhotoItem;
            if (selectedPhotoId) {
                setGalleryPhotos(old => old.map(p => p.id === selectedPhotoId ? updatedForm : p));
            }
            return updatedForm;
        });
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const url = await uploadImage(file);
        if (url) {
            handlePhotoChange('url', url);
        }
    };

    const addNewVideo = () => {
        const newId = videos.length > 0 ? Math.max(...videos.map(v => v.id)) + 1 : 1;
        const newItem: VideoItem = {
            id: newId,
            title: 'Yeni Video',
            youtubeUrl: '',
            videoId: '',
            duration: '00:00',
            thumbnail: ''
        };
        setVideos([...videos, newItem]);
        setSelectedVideoId(newId);
        setVideoForm(newItem);
        toast.success('Yeni video əlavə edildi');
    };

    const deleteVideo = async (id: any, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Bu videonu silmək istədiyinizə əminsiniz?')) {
            if (typeof id === 'string') {
                // Local state update is sufficient until save
            }
            setVideos(videos.filter(v => v.id !== id));
            if (selectedVideoId === id) setSelectedVideoId(null);
            toast.success('Video silindi');
        }
    };

    const deleteNews = async (id: any, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Bu xəbəri silmək istədiyinizə əminsiniz?')) {
            if (typeof id === 'string') {
                // Local state update is sufficient until save
            }
            setNews(news.filter(n => n.id !== id));
            if (selectedNewsId === id) setSelectedNewsId(null);
            toast.success('Xəbər silindi');
        }
    };

    // Drivers Handlers
    const handleCatSelect = (id: string) => {
        setSelectedCatId(id);
        setSelectedDriverId(null);
        setDriverForm({});
    };

    const handleDriverSelect = (id: number) => {
        setSelectedDriverId(id);
        const cat = driverCategories.find(c => c.id === selectedCatId);
        const driver = cat?.drivers.find(d => d.id === id);
        if (driver) {
            setDriverForm({ ...driver });
        }
    };

    const handleDriverChange = (field: keyof DriverItem, value: any) => {
        if (!selectedCatId || !selectedDriverId) return;

        // Update both form and master list
        setDriverForm(prev => {
            const updated = { ...prev, [field]: value } as DriverItem;

            setDriverCategories(prevCats => prevCats.map(c => {
                if (c.id === selectedCatId) {
                    return {
                        ...c,
                        drivers: c.drivers.map(d => d.id === selectedDriverId ? updated : d)
                    };
                }
                return c;
            }));

            return updated;
        });
    };

    const addDriver = () => {
        if (!selectedCatId) {
            toast.error('Öncə kateqoriya seçin və ya yaradın');
            return;
        }
        const newId = Date.now();
        const newDriver: DriverItem = {
            id: newId,
            rank: 99,
            name: 'Yeni Sürücü',
            license: 'PILOT LICENSE',
            team: 'TEAM NAME',
            wins: 0,
            points: 0,
            img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&fit=crop'
        };

        setDriverCategories(prev => prev.map(c => {
            if (c.id === selectedCatId) {
                return { ...c, drivers: [...c.drivers, newDriver] };
            }
            return c;
        }));

        setSelectedDriverId(newId);
        setDriverForm(newDriver);
        toast.success('Yeni sürücü siyahıya əlavə edildi');
    };

    const deleteDriver = (id: number) => {
        if (window.confirm('Bu sürücünü silmək istədiyinizə əminsiniz?')) {
            setDriverCategories(prev => prev.map(c => {
                if (c.id === selectedCatId) {
                    return { ...c, drivers: c.drivers.filter(d => d.id !== id) };
                }
                return c;
            }));
            if (selectedDriverId === id) {
                setSelectedDriverId(null);
                setDriverForm({});
            }
            toast.success('Sürücü silindi');
        }
    };

    const handleDriverSave = async () => {
        // Ensure master list is up to date one last time just in case
        const currentForm = driverForm as DriverItem;
        const updatedCats = driverCategories.map(c => {
            if (c.id === selectedCatId) {
                return {
                    ...c,
                    drivers: c.drivers.map(d => d.id === selectedDriverId ? { ...d, ...currentForm } as DriverItem : d)
                };
            }
            return c;
        });

        setIsSaving(true);
        const tid = toast.loading('Yadda saxlanılır...');
        try {
            const res = await fetch('/api/drivers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedCats)
            });
            if (!res.ok) throw new Error('Save failed');
            setDriverCategories(updatedCats);
            toast.success('Bütün sürücü məlumatları qeyd edildi', { id: tid });
        } catch (err) {
            toast.error('Xəta baş verdi', { id: tid });
        } finally {
            setIsSaving(false);
        }
    };

    const addCategory = () => {
        const name = window.prompt('Kateqoriya adı (Məs: UNLIMITED CLASS):');
        if (!name) return;
        const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        if (driverCategories.find(c => c.id === id)) {
            toast.error('Bu adda kateqoriya artıq mövcuddur');
            return;
        }
        const newCat: DriverCategory = { id, name, drivers: [] };
        setDriverCategories([...driverCategories, newCat]);
        setSelectedCatId(id);
        toast.success('Kateqoriya əlavə edildi');
    };

    const deleteCategory = () => {
        if (!selectedCatId) return;
        const cat = driverCategories.find(c => c.id === selectedCatId);
        if (!cat) return;

        if (window.confirm(`"${cat.name}" kateqoriyasını və içindəki bütün sürücüləri silmək istədiyinizə əminsiniz?`)) {
            const newCats = driverCategories.filter(c => c.id !== selectedCatId);
            setDriverCategories(newCats);
            if (newCats.length > 0) {
                setSelectedCatId(newCats[0].id);
            } else {
                setSelectedCatId(null);
            }
            setSelectedDriverId(null);
            setDriverForm({});
            toast.success('Kateqoriya silindi');
        }
    };

    if (pages.length === 0 && !isExtracting && !localStorage.getItem('octo_extracted')) {
        return (
            <div className="extractor-overlay">
                <div className="extractor-card fade-in">
                    <Globe size={64} className="text-primary" style={{ marginBottom: '1.5rem' }} />
                    <h2>Sayt Məzmununu və Görselləri Çıxarın</h2>
                    <p>Front-end layihənizdəki bütün səhifələri, mətnləri və şəkilləri avtomatik olaraq bu panelə yükləyin.</p>
                    <button className="extract-btn" onClick={startExtraction}>
                        Sinxronizasiyanı Başlat
                    </button>
                </div>
            </div>
        );
    }

    if (isExtracting) {
        return (
            <div className="extractor-overlay">
                <div className="extractor-card">
                    <div className="loader-ring" style={{ marginBottom: '1.5rem' }}></div>
                    <h2>Avtomatik Sinxronizasiya</h2>
                    <p>Zəhmət olmasa gözləyin, front-end məlumatları oxunur...</p>
                    <div className="progress-container">
                        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="step-label">{extractStep}</div>
                </div>
            </div>
        );
    }

    const currentPage = pages[selectedPageIndex];

    // Filter logic
    const filteredPages = pages.map((page, idx) => ({ page, idx })).filter(({ page }) => {
        if (!searchTerm) return true;
        const lower = searchTerm.toLowerCase();
        const matchTitle = page.title.toLowerCase().includes(lower);
        const matchText = page.sections.some(s => s.label.toLowerCase().includes(lower) || s.value.toLowerCase().includes(lower));
        const matchImg = page.images.some(i => i.alt.toLowerCase().includes(lower) || i.path.toLowerCase().includes(lower));
        return matchTitle || matchText || matchImg;
    });

    const displayedSections = currentPage?.sections.filter(s =>
        !searchTerm ||
        s.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.value.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const displayedImages = currentPage?.images.filter(i =>
        !searchTerm ||
        i.alt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.path.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    return (
        <div className="visual-editor fade-in">
            <div className="editor-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="header-info">
                        <h1><Globe size={24} /> Admin Panel</h1>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <button
                                className={`mode-btn ${editorMode === 'extract' ? 'active' : ''}`}
                                onClick={() => setEditorMode('extract')}
                                style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: editorMode === 'extract' ? 'var(--primary)' : '#eee', color: editorMode === 'extract' ? '#fff' : '#666', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                                Sayt Məzmunu
                            </button>
                            <button
                                className={`mode-btn ${editorMode === 'events' ? 'active' : ''}`}
                                onClick={() => setEditorMode('events')}
                                style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: editorMode === 'events' ? 'var(--primary)' : '#eee', color: editorMode === 'events' ? '#fff' : '#666', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                                Tədbirlər
                            </button>
                            <button
                                className={`mode-btn ${editorMode === 'news' ? 'active' : ''}`}
                                onClick={() => setEditorMode('news')}
                                style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: editorMode === 'news' ? 'var(--primary)' : '#eee', color: editorMode === 'news' ? '#fff' : '#666', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                                Xəbərlər
                            </button>
                            <button
                                className={`mode-btn ${editorMode === 'drivers' ? 'active' : ''}`}
                                onClick={() => setEditorMode('drivers')}
                                style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: editorMode === 'drivers' ? 'var(--primary)' : '#eee', color: editorMode === 'drivers' ? '#fff' : '#666', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                                Sürücülər
                            </button>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button
                            className="sync-btn"
                            onClick={() => window.location.reload()}
                            style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', padding: '10px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            title="Səhifəni yenilə"
                        >
                            <RotateCcw size={18} />
                        </button>
                        <button
                            className="sync-btn"
                            onClick={startExtraction}
                            disabled={isExtracting}
                            style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '10px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', cursor: 'pointer' }}
                        >
                            <RotateCcw size={18} className={isExtracting ? 'spin' : ''} />
                            {isExtracting ? 'Sinxronlaşdırılır...' : 'Sinxron Et'}
                        </button>
                        <button
                            className={`save-btn ${isSaving ? 'saving' : ''}`}
                            onClick={saveChanges}
                            disabled={isSaving}
                        >
                            {isSaving ? 'Gözləyin...' : <><Save size={18} /> Yenilə</>}
                        </button>
                    </div>
                </div>

                <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        type="text"
                        placeholder="Komponentləri və məzmunu axtar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', fontSize: '1rem', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc', transition: 'all 0.2s' }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                    />
                </div>
            </div>

            {editorMode === 'news' ? (
                <div className="editor-layout">
                    <aside className="page-list">
                        <div className="list-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3>Xəbərlər</h3>
                            <button className="add-section-btn" onClick={addNewNews}>
                                <Plus size={16} />
                            </button>
                        </div>
                        <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 300px)' }}>
                            {news.length === 0 ? (
                                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem', border: '1px dashed #e2e8f0', borderRadius: '8px' }}>
                                    Hələ heç bir xəbər yoxdur. Yeni xəbər yaratmaq üçün yuxarıdakı "+" düyməsini basın.
                                </div>
                            ) : (
                                news.map((item) => (
                                    <div key={item.id} className="page-nav-wrapper" style={{ position: 'relative', marginBottom: '4px' }}>
                                        <button
                                            className={`page-nav-item ${selectedNewsId === item.id ? 'active' : ''}`}
                                            onClick={() => handleNewsSelect(item.id)}
                                            style={{ width: '100%', paddingRight: '40px', textAlign: 'left' }}
                                        >
                                            <FileText size={14} /> {item.title}
                                            <div style={{ fontSize: '10px', color: '#999', marginLeft: '24px' }}>{item.date}</div>
                                        </button>
                                        <button
                                            className="delete-section-btn"
                                            onClick={(e) => deleteNews(item.id, e)}
                                            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#ff4d4f', opacity: 0.5, cursor: 'pointer' }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </aside>

                    <main className="editor-canvas" style={{ padding: '0' }}>
                        {selectedNewsId !== null && newsForm.id !== undefined ? (
                            <div className="event-editor-full" style={{ padding: '2rem', height: '100%', overflowY: 'auto' }}>
                                <div className="canvas-header" style={{ marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                                    <h2 style={{ fontSize: '2rem' }}>{newsForm.title}</h2>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <span style={{ background: newsForm.status === 'published' ? '#dcfce7' : '#fef9c3', color: newsForm.status === 'published' ? '#166534' : '#854d0e', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                                            {newsForm.status === 'published' ? 'DƏRC EDİLİB' : 'QARALAMA'}
                                        </span>
                                    </div>
                                </div>

                                <div className="edit-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '12px', color: '#64748b' }}>XƏBƏRİN BAŞLIĞI</label>
                                        <input
                                            type="text"
                                            value={newsForm.title}
                                            onChange={(e) => handleNewsChange('title', e.target.value, newsForm.id)}
                                            style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '12px', color: '#64748b' }}>TARİX</label>
                                        <input
                                            type="date"
                                            value={newsForm.date}
                                            onChange={(e) => handleNewsChange('date', e.target.value, newsForm.id)}
                                            style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '12px', color: '#64748b' }}>KATEQORİYA</label>
                                        <input
                                            type="text"
                                            value={newsForm.category || ''}
                                            onChange={(e) => handleNewsChange('category', e.target.value, newsForm.id)}
                                            style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '12px', color: '#64748b' }}>STATUS</label>
                                        <select
                                            value={newsForm.status}
                                            onChange={(e) => handleNewsChange('status', e.target.value, newsForm.id)}
                                            style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
                                        >
                                            <option value="draft">Qaralama (Draft)</option>
                                            <option value="published">Dərc edilsin (Published)</option>
                                        </select>
                                    </div>

                                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '12px', color: '#64748b' }}>ƏSAS ŞƏKİL</label>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                            <div style={{ width: '120px', height: '80px', borderRadius: '8px', overflow: 'hidden', background: '#f1f5f9', border: '1px solid #e2e8f0' }}>
                                                {newsForm.img ? (
                                                    <img src={newsForm.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <ImageIcon size={24} style={{ opacity: 0.2 }} />
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ flex: 1, display: 'flex', gap: '0.5rem' }}>
                                                <input
                                                    type="text"
                                                    value={newsForm.img || ''}
                                                    onChange={(e) => handleNewsChange('img', e.target.value, newsForm.id)}
                                                    placeholder="Şəkil URL və ya yol..."
                                                    style={{ flex: 1, padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
                                                />
                                                <div style={{ position: 'relative' }}>
                                                    <input
                                                        type="file"
                                                        id="news-img-upload"
                                                        style={{ display: 'none' }}
                                                        accept="image/*"
                                                        onChange={async (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                const url = await uploadImage(file);
                                                                if (url) handleNewsChange('img', url, newsForm.id);
                                                            }
                                                        }}
                                                    />
                                                    <button
                                                        onClick={() => document.getElementById('news-img-upload')?.click()}
                                                        title="Kompüterdən yüklə"
                                                        style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                                    >
                                                        <Plus size={18} /> Yüklə
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '12px', color: '#64748b' }}>MƏZMUN (CONTENT)</label>
                                        <BBCodeEditor
                                            id="news-desc"
                                            value={newsForm.description || ''}
                                            onChange={(val) => handleNewsChange('description', val, newsForm.id)}
                                        />
                                    </div>
                                </div>
                                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                    <p style={{ color: '#94a3b8', fontSize: '12px', display: 'flex', alignItems: 'center' }}>
                                        * Dəyişikliklər avtomatik sinxronizasiya olunur. Daimi yadda saxlamaq üçün yuxarıdakı "Yenilə" düyməsinə basın.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', flexDirection: 'column', gap: '1rem' }}>
                                <FileText size={48} style={{ opacity: 0.2 }} />
                                <p>Redaktə etmək üçün sol tərəfdən xəbər seçin və ya yeni yaradın.</p>
                            </div>
                        )}
                    </main>
                </div>
            ) : editorMode === 'events' ? (
                <div className="editor-layout">
                    <aside className="page-list">
                        <div className="list-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3>Tədbirlər</h3>
                            <button className="add-section-btn" onClick={addNewEvent}>
                                <Plus size={16} />
                            </button>
                        </div>
                        <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 300px)' }}>
                            {events.length === 0 ? (
                                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem', border: '1px dashed #e2e8f0', borderRadius: '8px' }}>
                                    Hələ heç bir tədbir yoxdur. Yeni tədbir yaratmaq üçün yuxarıdakı "+" düyməsini basın.
                                </div>
                            ) : (
                                events.map((evt) => (
                                    <div key={evt.id} className="page-nav-wrapper" style={{ position: 'relative', marginBottom: '4px' }}>
                                        <button
                                            className={`page-nav-item ${selectedEventId === evt.id ? 'active' : ''}`}
                                            onClick={() => handleEventSelect(evt.id)}
                                            style={{ width: '100%', paddingRight: '40px', textAlign: 'left' }}
                                        >
                                            <Calendar size={14} /> {evt.title}
                                            <div style={{ fontSize: '10px', color: '#999', marginLeft: '24px' }}>{evt.date}</div>
                                        </button>
                                        <button
                                            className="delete-section-btn"
                                            onClick={(e) => deleteEvent(evt.id, e)}
                                            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#ff4d4f', opacity: 0.5, cursor: 'pointer' }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </aside>

                    <main className="editor-canvas" style={{ padding: '0' }}>
                        {selectedEventId !== null && eventForm.id !== undefined ? (
                            <div className="event-editor-full" style={{ padding: '2rem', height: '100%', overflowY: 'auto' }}>
                                <div className="canvas-header" style={{ marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                                    <h2 style={{ fontSize: '2rem' }}>{eventForm.title}</h2>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <span style={{ background: eventForm.status === 'planned' ? '#e0f2fe' : '#fce7f3', color: eventForm.status === 'planned' ? '#0284c7' : '#db2777', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                                            {eventForm.status === 'planned' ? 'PLANLAŞDIRILIR' : 'KEÇMİŞ'}
                                        </span>
                                    </div>
                                </div>

                                <div className="edit-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '12px', color: '#64748b' }}>TƏDBİRİN ADI</label>
                                        <input
                                            type="text"
                                            value={eventForm.title}
                                            onChange={(e) => handleEventChange('title', e.target.value, eventForm.id)}
                                            style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '12px', color: '#64748b' }}>TARİX</label>
                                        <input
                                            type="date"
                                            value={eventForm.date}
                                            onChange={(e) => handleEventChange('date', e.target.value, eventForm.id)}
                                            style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '12px', color: '#64748b' }}>MƏKAN</label>
                                        <div style={{ position: 'relative' }}>
                                            <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                            <input
                                                type="text"
                                                value={eventForm.location}
                                                onChange={(e) => handleEventChange('location', e.target.value, eventForm.id)}
                                                style={{ width: '100%', padding: '12px 12px 12px 40px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '12px', color: '#64748b' }}>KATEQORİYA</label>
                                        <input
                                            type="text"
                                            value={eventForm.category}
                                            onChange={(e) => handleEventChange('category', e.target.value, eventForm.id)}
                                            style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '12px', color: '#64748b' }}>STATUS</label>
                                        <select
                                            value={eventForm.status}
                                            onChange={(e) => handleEventChange('status', e.target.value, eventForm.id)}
                                            style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
                                        >
                                            <option value="planned">Gələcək (Planned)</option>
                                            <option value="past">Keçmiş (Past)</option>
                                        </select>
                                    </div>

                                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '12px', color: '#64748b' }}>ƏSAS ŞƏKİL</label>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                            <div style={{ width: '120px', height: '80px', borderRadius: '8px', overflow: 'hidden', background: '#f1f5f9', border: '1px solid #e2e8f0' }}>
                                                {eventForm.img ? (
                                                    <img src={eventForm.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <ImageIcon size={24} style={{ opacity: 0.2 }} />
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ flex: 1, display: 'flex', gap: '0.5rem' }}>
                                                <input
                                                    type="text"
                                                    value={eventForm.img || ''}
                                                    onChange={(e) => handleEventChange('img', e.target.value, eventForm.id)}
                                                    placeholder="Şəkil URL və ya yol..."
                                                    style={{ flex: 1, padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
                                                />
                                                <div style={{ position: 'relative' }}>
                                                    <input
                                                        type="file"
                                                        id="event-img-upload"
                                                        style={{ display: 'none' }}
                                                        accept="image/*"
                                                        onChange={async (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                const url = await uploadImage(file);
                                                                if (url) handleEventChange('img', url, eventForm.id);
                                                            }
                                                        }}
                                                    />
                                                    <button
                                                        onClick={() => document.getElementById('event-img-upload')?.click()}
                                                        title="Kompüterdən yüklə"
                                                        style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                                    >
                                                        <Plus size={18} /> Yüklə
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '12px', color: '#64748b' }}>TƏSVİR (DESCRIPTION)</label>
                                        <BBCodeEditor
                                            id="event-desc"
                                            value={eventForm.description || ''}
                                            onChange={(val) => handleEventChange('description', val, eventForm.id)}
                                        />
                                    </div>

                                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '12px', color: '#64748b' }}>QAYDALAR (RULES)</label>
                                        <BBCodeEditor
                                            id="event-rules"
                                            value={eventForm.rules || ''}
                                            onChange={(val) => handleEventChange('rules', val, eventForm.id)}
                                        />
                                    </div>

                                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '12px', color: '#64748b' }}>TƏLİMAT (PDF URL)</label>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                            <input
                                                type="text"
                                                value={eventForm.pdfUrl || ''}
                                                onChange={(e) => handleEventChange('pdfUrl', e.target.value, eventForm.id)}
                                                placeholder="https://... və ya /uploads/..."
                                                style={{ flex: 1, padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
                                            />
                                            <div style={{ position: 'relative' }}>
                                                <input
                                                    type="file"
                                                    id="pdf-upload"
                                                    style={{ display: 'none' }}
                                                    accept=".pdf"
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const url = await uploadImage(file); // reuse image upload for now
                                                            if (url) handleEventChange('pdfUrl', url, eventForm.id);
                                                        }
                                                    }}
                                                />
                                                <button
                                                    onClick={() => document.getElementById('pdf-upload')?.click()}
                                                    style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                                >
                                                    <FileText size={18} /> Yüklə
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                    <p style={{ color: '#94a3b8', fontSize: '12px', display: 'flex', alignItems: 'center' }}>
                                        * Dəyişikliklər avtomatik sinxronizasiya olunur. Daimi yadda saxlamaq üçün yuxarıdakı "Yenilə" düyməsinə basın.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', flexDirection: 'column', gap: '1rem' }}>
                                <Calendar size={48} style={{ opacity: 0.2 }} />
                                <p>Redaktə etmək üçün sol tərəfdən tədbir seçin və ya yeni yaradın.</p>
                            </div>
                        )}
                    </main>
                </div>
            ) : editorMode === 'drivers' ? (
                <div className="editor-layout">
                    <aside className="page-list">
                        <div className="list-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3>Kateqoriyalar</h3>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                <button className="add-section-btn" onClick={addCategory} title="Kateqoriya əlavə et">
                                    <Plus size={16} />
                                </button>
                                <button className="delete-section-btn" onClick={deleteCategory} title="Seçilmiş kateqoriyanı sil" style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', padding: '4px' }}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                        <select
                            value={selectedCatId || ''}
                            onChange={(e) => handleCatSelect(e.target.value)}
                            style={{ width: '100%', padding: '10px', marginBottom: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', fontWeight: 'bold' }}
                        >
                            {driverCategories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>

                        <div className="list-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3>Sürücülər</h3>
                            <button className="add-section-btn" onClick={addDriver}>
                                <Plus size={16} />
                            </button>
                        </div>
                        <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 400px)' }}>
                            {selectedCatId && driverCategories.find(c => c.id === selectedCatId)?.drivers.length === 0 ? (
                                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
                                    Bu kateqoriyada sürücü yoxdur.
                                </div>
                            ) : (
                                driverCategories.find(c => c.id === selectedCatId)?.drivers.map((d) => (
                                    <div key={d.id} className="page-nav-wrapper" style={{ position: 'relative', marginBottom: '4px' }}>
                                        <button
                                            className={`page-nav-item ${selectedDriverId === d.id ? 'active' : ''}`}
                                            onClick={() => handleDriverSelect(d.id)}
                                            style={{ width: '100%', paddingRight: '40px', textAlign: 'left' }}
                                        >
                                            <span style={{ fontWeight: '900', color: 'var(--primary)', marginRight: '8px' }}>#{d.rank}</span> {d.name}
                                        </button>
                                        <button
                                            className="delete-section-btn"
                                            onClick={(e) => { e.stopPropagation(); deleteDriver(d.id); }}
                                            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#ff4d4f', opacity: 0.5, cursor: 'pointer' }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </aside>

                    <main className="editor-canvas" style={{ padding: '0' }}>
                        {selectedDriverId !== null && driverForm.id !== undefined ? (
                            <div style={{ padding: '2rem', height: '100%', overflowY: 'auto' }}>
                                <div className="canvas-header" style={{ marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                                    <h2 style={{ fontSize: '2rem' }}>{driverForm.name}</h2>
                                    <p style={{ color: '#64748b' }}>{driverCategories.find(c => c.id === selectedCatId)?.name} // RANK #{driverForm.rank}</p>
                                </div>

                                <div className="edit-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '12px', color: '#64748b' }}>AD SOYAD</label>
                                        <input
                                            type="text"
                                            value={driverForm.name}
                                            onChange={(e) => handleDriverChange('name', e.target.value)}
                                            style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '12px', color: '#64748b' }}>SIRA (RANK)</label>
                                        <input
                                            type="number"
                                            value={driverForm.rank}
                                            readOnly
                                            style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '16px', background: '#f8fafc', color: '#94a3b8', cursor: 'not-allowed' }}
                                        />
                                        <p style={{ fontSize: '10px', color: '#3b82f6', marginTop: '4px', fontWeight: 'bold' }}>* Sira xallara əsasən sistem tərəfindən avtomatik təyin edilir</p>
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '12px', color: '#64748b' }}>LİSENZİYA</label>
                                        <input
                                            type="text"
                                            value={driverForm.license}
                                            onChange={(e) => handleDriverChange('license', e.target.value)}
                                            style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '12px', color: '#64748b' }}>KOMANDA (TEAM)</label>
                                        <input
                                            type="text"
                                            value={driverForm.team}
                                            onChange={(e) => handleDriverChange('team', e.target.value)}
                                            style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '12px', color: '#64748b' }}>QALİBİYYƏT (WINS)</label>
                                        <input
                                            type="number"
                                            value={driverForm.wins}
                                            onChange={(e) => handleDriverChange('wins', parseInt(e.target.value))}
                                            style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '12px', color: '#64748b' }}>XAL (POINTS)</label>
                                        <input
                                            type="number"
                                            value={driverForm.points}
                                            onChange={(e) => handleDriverChange('points', parseInt(e.target.value))}
                                            style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
                                        />
                                    </div>

                                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '12px', color: '#64748b' }}>PİLOT ŞƏKLİ</label>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', background: '#f1f5f9', border: '2px solid var(--primary)' }}>
                                                {driverForm.img ? (
                                                    <img src={driverForm.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <ImageIcon size={24} style={{ opacity: 0.2 }} />
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ flex: 1, display: 'flex', gap: '0.5rem' }}>
                                                <input
                                                    type="text"
                                                    value={driverForm.img || ''}
                                                    onChange={(e) => handleDriverChange('img', e.target.value)}
                                                    placeholder="Şəkil URL və ya yol..."
                                                    style={{ flex: 1, padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
                                                />
                                                <input
                                                    type="file"
                                                    id="driver-img-upload"
                                                    style={{ display: 'none' }}
                                                    accept="image/*"
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const url = await uploadImage(file);
                                                            if (url) handleDriverChange('img', url);
                                                        }
                                                    }}
                                                />
                                                <button
                                                    onClick={() => document.getElementById('driver-img-upload')?.click()}
                                                    style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '8px', cursor: 'pointer' }}
                                                >
                                                    Yüklə
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                                    <button className="btn-primary" onClick={handleDriverSave} disabled={isSaving}>
                                        {isSaving ? 'Gözləyin...' : 'Sürücünü Yadda Saxla'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', flexDirection: 'column', gap: '1rem' }}>
                                <Trophy size={48} style={{ opacity: 0.2 }} />
                                <p>Redaktə etmək üçün sol tərəfdən sürücü seçin.</p>
                            </div>
                        )}
                    </main>
                </div>
            ) : editorMode === 'videos' ? (
                <div className="editor-layout">
                    <aside className="page-list">
                        <div className="list-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3>Videolar</h3>
                            <button className="add-section-btn" onClick={addNewVideo}>
                                <Plus size={16} />
                            </button>
                        </div>
                        <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 300px)' }}>
                            {videos.length === 0 ? (
                                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
                                    Heç bir video əlavə edilməyib.
                                </div>
                            ) : (
                                videos.map((v) => (
                                    <div key={v.id} className="page-nav-wrapper" style={{ position: 'relative', marginBottom: '4px' }}>
                                        <button
                                            className={`page-nav-item ${selectedVideoId === v.id ? 'active' : ''}`}
                                            onClick={() => handleVideoSelect(v.id)}
                                            style={{ width: '100%', paddingRight: '40px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}
                                        >
                                            <div style={{ width: '24px', height: '16px', background: '#333', borderRadius: '2px', overflow: 'hidden' }}>
                                                {v.thumbnail && <img src={v.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                            </div>
                                            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.title}</span>
                                        </button>
                                        <button
                                            className="delete-section-btn"
                                            onClick={(e) => { e.stopPropagation(); deleteVideo(v.id, e); }}
                                            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#ff4d4f', opacity: 0.5, cursor: 'pointer' }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </aside>

                    <main className="editor-canvas" style={{ padding: '0' }}>
                        {selectedVideoId !== null && videoForm.id !== undefined ? (
                            <div style={{ padding: '2rem', height: '100%', overflowY: 'auto' }}>
                                <div className="canvas-header" style={{ marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                                    <h2 style={{ fontSize: '2rem' }}>Video Redaktəsi</h2>
                                    <p style={{ color: '#64748b' }}>{videoForm.title} // ID: {videoForm.id}</p>
                                </div>

                                <div className="edit-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', maxWidth: '800px' }}>
                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '12px', color: '#64748b' }}>VİDEO BAŞLIĞI</label>
                                        <input
                                            type="text"
                                            value={videoForm.title}
                                            onChange={(e) => handleVideoChange('title', e.target.value)}
                                            style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '12px', color: '#64748b' }}>YOUTUBE URL</label>
                                        <div style={{ position: 'relative' }}>
                                            <Globe size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                            <input
                                                type="text"
                                                value={videoForm.youtubeUrl}
                                                onChange={(e) => handleVideoChange('youtubeUrl', e.target.value)}
                                                placeholder="https://www.youtube.com/watch?v=..."
                                                style={{ width: '100%', padding: '12px 12px 12px 40px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
                                            />
                                        </div>
                                        <p style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>YouTube linkini daxil etdikdə şəkil və ID avtomatik təyin olunacaq.</p>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                        <div className="form-group">
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '12px', color: '#64748b' }}>MÜDDƏT (MƏS: 05:20)</label>
                                            <input
                                                type="text"
                                                value={videoForm.duration}
                                                onChange={(e) => handleVideoChange('duration', e.target.value)}
                                                style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '12px', color: '#64748b' }}>VİDEO ID (AVTOMATİK)</label>
                                            <input
                                                type="text"
                                                value={videoForm.videoId}
                                                readOnly
                                                style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', background: '#f8fafc', color: '#94a3b8' }}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '12px', color: '#64748b' }}>ÖNİZLƏMƏ (THUMBNAIL)</label>
                                        <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '12px', overflow: 'hidden', background: '#000', border: '1px solid #e2e8f0', position: 'relative' }}>
                                            {videoForm.thumbnail ? (
                                                <img src={videoForm.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
                                                    <Video size={48} style={{ opacity: 0.1, color: 'white' }} />
                                                    <p style={{ color: '#64748b', fontSize: '12px' }}>YouTube linki daxil edin</p>
                                                </div>
                                            )}
                                            {videoForm.videoId && (
                                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', cursor: 'pointer' }} onClick={() => window.open(videoForm.youtubeUrl, '_blank')}>
                                                    <div style={{ background: '#FF4D00', color: 'white', padding: '12px', borderRadius: '50%', boxShadow: '0 0 20px rgba(255,77,0,0.4)' }}>
                                                        <Play size={24} fill="currentColor" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', flexDirection: 'column', gap: '1rem' }}>
                                <Video size={48} style={{ opacity: 0.2 }} />
                                <p>Redaktə etmək üçün sol tərəfdən video seçin və ya yeni əlavə edin.</p>
                            </div>
                        )}
                    </main>
                </div>
            ) : editorMode === 'photos' ? (
                <div className="editor-layout">
                    <aside className="page-list">
                        <div className="list-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3>Foto Arxiv</h3>
                            <button className="add-section-btn" onClick={addGalleryPhoto} title="Yeni şəkil əlavə et">
                                <Plus size={16} />
                            </button>
                        </div>
                        <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
                            {galleryPhotos.length === 0 ? (
                                <p style={{ padding: '20px', color: '#94a3b8', textAlign: 'center', fontSize: '13px' }}>Şəkil yoxdur</p>
                            ) : (
                                galleryPhotos.map((photo) => (
                                    <div key={photo.id} className="page-nav-wrapper" style={{ position: 'relative', marginBottom: '4px' }}>
                                        <button
                                            className={`page-nav-item ${selectedPhotoId === photo.id ? 'active' : ''}`}
                                            onClick={() => handlePhotoSelect(photo.id)}
                                            style={{ width: '100%', paddingRight: '40px', display: 'flex', alignItems: 'center', gap: '8px' }}
                                        >
                                            <div style={{ width: '24px', height: '24px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0, background: '#eee' }}>
                                                {photo.url ? <img src={photo.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon size={12} style={{ margin: '6px', opacity: 0.3 }} />}
                                            </div>
                                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{photo.title}</span>
                                        </button>
                                        <button
                                            className="delete-section-btn"
                                            onClick={(e) => deleteGalleryPhoto(photo.id, e)}
                                            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#ff4d4f', opacity: 0.5, cursor: 'pointer' }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </aside>

                    <main className="editor-canvas" style={{ padding: '0' }}>
                        {selectedPhotoId !== null && photoForm.id !== undefined ? (
                            <div style={{ padding: '2rem', height: '100%', overflowY: 'auto' }}>
                                <div className="canvas-header" style={{ marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                                    <h2 style={{ fontSize: '2rem' }}>Şəkil Redaktəsi</h2>
                                    <p style={{ color: '#64748b' }}>{photoForm.title} // ID: {photoForm.id}</p>
                                </div>

                                <div className="edit-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', maxWidth: '800px' }}>
                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '12px', color: '#64748b' }}>ŞƏKİL BAŞLIĞI</label>
                                        <input
                                            type="text"
                                            value={photoForm.title}
                                            onChange={(e) => handlePhotoChange('title', e.target.value)}
                                            style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '12px', color: '#64748b' }}>FOTO</label>
                                        <div style={{ width: '100%', minHeight: '300px', borderRadius: '12px', overflow: 'hidden', background: '#f8fafc', border: '1px dashed #cbd5e1', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
                                            {photoForm.url ? (
                                                <img src={photoForm.url} alt="" style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }} />
                                            ) : (
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
                                                    <ImageIcon size={48} style={{ opacity: 0.1 }} />
                                                    <p style={{ color: '#64748b', fontSize: '12px' }}>Şəkil seçilməyib</p>
                                                </div>
                                            )}
                                            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                                                <input
                                                    type="file"
                                                    id="gallery-photo-upload"
                                                    style={{ display: 'none' }}
                                                    accept="image/*"
                                                    onChange={handlePhotoUpload}
                                                />
                                                <button
                                                    onClick={() => document.getElementById('gallery-photo-upload')?.click()}
                                                    className="btn-primary"
                                                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                                                >
                                                    <Plus size={18} /> Şəkil Yüklə
                                                </button>
                                                <input
                                                    type="text"
                                                    value={photoForm.url || ''}
                                                    onChange={(e) => handlePhotoChange('url', e.target.value)}
                                                    placeholder="URL və ya yol..."
                                                    style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', width: '250px' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', flexDirection: 'column', gap: '1rem' }}>
                                <ImageIcon size={48} style={{ opacity: 0.2 }} />
                                <p>Redaktə etmək üçün sol tərəfdən şəkil seçin və ya yeni əlavə edin.</p>
                            </div>
                        )}
                    </main>
                </div>
            ) : (
                <div className="editor-layout">
                    <aside className="page-list">
                        <div className="list-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3>Komponentlər</h3>
                            <button className="add-section-btn" onClick={() => setIsModalOpen(true)}>
                                <Plus size={16} />
                            </button>
                        </div>
                        <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 300px)' }}>
                            {filteredPages.map(({ page, idx }) => (
                                <div key={idx} className="page-nav-wrapper" style={{ position: 'relative', marginBottom: '4px' }}>
                                    <button
                                        className={`page-nav-item ${selectedPageIndex === idx ? 'active' : ''}`}
                                        onClick={() => setSelectedPageIndex(idx)}
                                        style={{ width: '100%', paddingRight: '40px' }}
                                    >
                                        <Layout size={16} /> {page.title}
                                        {searchTerm && (
                                            <span style={{ marginLeft: 'auto', fontSize: '9px', background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '10px' }}>
                                                {(page.sections.filter(s => s.label.toLowerCase().includes(searchTerm.toLowerCase()) || s.value.toLowerCase().includes(searchTerm.toLowerCase())).length +
                                                    page.images.filter(i => i.alt.toLowerCase().includes(searchTerm.toLowerCase()) || i.path.toLowerCase().includes(searchTerm.toLowerCase())).length) > 0 ? 'Tapıldı' : ''}
                                            </span>
                                        )}
                                    </button>
                                    <button
                                        className="delete-section-btn"
                                        onClick={(e) => deleteSection(idx, e)}
                                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#ff4d4f', opacity: selectedPageIndex === idx ? 1 : 0.3, cursor: 'pointer' }}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </aside>

                    <main className="editor-canvas">
                        <div className="canvas-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2>{currentPage?.title} Bölməsi</h2>
                            {editorMode === 'extract' && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: currentPage?.active !== false ? '#10b981' : '#ef4444' }}>
                                        {currentPage?.active !== false ? 'AKTİV' : 'DEAKTİV'}
                                    </span>
                                    <button
                                        onClick={() => {
                                            const newPages = [...pages];
                                            newPages[selectedPageIndex].active = currentPage?.active === false ? true : false;
                                            setPages(newPages);
                                            toast.success(newPages[selectedPageIndex].active ? 'Bölmə aktivləşdirildi' : 'Bölmə deaktiv edildi');
                                        }}
                                        style={{
                                            width: '50px',
                                            height: '24px',
                                            borderRadius: '12px',
                                            background: currentPage?.active !== false ? '#10b981' : '#cbd5e1',
                                            position: 'relative',
                                            cursor: 'pointer',
                                            border: 'none',
                                            transition: 'background 0.3s'
                                        }}
                                    >
                                        <div style={{
                                            width: '18px',
                                            height: '18px',
                                            borderRadius: '50%',
                                            background: 'white',
                                            position: 'absolute',
                                            top: '3px',
                                            left: currentPage?.active !== false ? '29px' : '3px',
                                            transition: 'left 0.3s'
                                        }} />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="edit-fields">
                            <div className="field-group">
                                <div className="field-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <label><Type size={16} /> Mətn Rezervləri</label>
                                    <button className="add-field-minimal" onClick={() => addField('text')}>
                                        <Plus size={14} /> Mətn Əlavə Et
                                    </button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {displayedSections.length === 0 && searchTerm ? (
                                        <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem', border: '1px dashed #e2e8f0', borderRadius: '8px' }}>
                                            Bu səhifədə sorğuya uyğun mətn tapılmadı.
                                        </div>
                                    ) : (
                                        displayedSections.map((section) => (
                                            <div key={section.id} className="field-item-wrapper" style={{ position: 'relative', background: '#fcfcfd', padding: '1rem', borderRadius: '12px', border: '1px solid #f0f0f2' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                    <input
                                                        type="text"
                                                        value={section.label}
                                                        onChange={(e) => handleSectionChange(selectedPageIndex, section.id, 'label', e.target.value)}
                                                        style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary)', border: 'none', background: 'none', width: 'auto', padding: 0 }}
                                                    />
                                                    <span style={{ fontSize: '10px', color: '#ccc' }}>• REZERV</span>
                                                </div>
                                                <textarea
                                                    rows={2}
                                                    value={section.value}
                                                    onChange={(e) => handleSectionChange(selectedPageIndex, section.id, 'value', e.target.value)}
                                                    placeholder="Mətn daxil edin..."
                                                    style={{ background: '#fff' }}
                                                />
                                                <button
                                                    className="field-delete-btn"
                                                    onClick={() => removeField('text', section.id)}
                                                    style={{ position: 'absolute', right: '10px', top: '10px', background: '#fff', border: '1px solid #fee2e2', color: '#ef4444', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        )))}
                                </div>
                            </div>

                            <div className="field-group">
                                <div className="field-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <label><ImageIcon size={16} /> Bölmədəki Şəkillər</label>
                                    <button className="add-field-minimal" onClick={() => addField('image')}>
                                        <Plus size={14} /> Yeni Şəkil Yeri
                                    </button>
                                </div>
                                <div className="images-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
                                    {displayedImages.length > 0 ? (
                                        displayedImages.map((img) => (
                                            <div key={img.id} className="image-edit-card" style={{ border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden', background: '#fff', position: 'relative' }}>
                                                <button
                                                    className="field-delete-btn"
                                                    onClick={() => removeField('image', img.id)}
                                                    style={{ position: 'absolute', right: '8px', top: '8px', zIndex: 10, background: 'rgba(255,255,255,0.9)', border: '1px solid #fee2e2', color: '#ef4444', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                                <div style={{ height: '120px', background: '#f8fafc', position: 'relative', overflow: 'hidden' }}>
                                                    {img.path && (img.path.startsWith('http') || img.path.startsWith('/')) ? (
                                                        <img src={img.path} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
                                                            <ImageIcon size={32} style={{ opacity: 0.1 }} />
                                                            <span style={{ fontSize: '10px', color: '#999', position: 'absolute', bottom: '10px' }}>Yol yoxdur</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div style={{ padding: '0.75rem' }}>
                                                    <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '4px' }}>
                                                        <input
                                                            type="text"
                                                            placeholder="Resur yolu..."
                                                            value={img.path}
                                                            onChange={(e) => {
                                                                const newPages = [...pages];
                                                                const realIdx = newPages[selectedPageIndex].images.findIndex(i => i.id === img.id);
                                                                if (realIdx !== -1) {
                                                                    newPages[selectedPageIndex].images[realIdx].path = e.target.value;
                                                                    setPages(newPages);
                                                                }
                                                            }}
                                                            style={{ fontSize: '0.75rem', flex: 1, padding: '0.4rem', border: '1px solid #eee', borderRadius: '4px' }}
                                                        />
                                                        <button
                                                            onClick={() => openImageSelector(selectedPageIndex, img.id)}
                                                            title="Sistemdən seç"
                                                            style={{ padding: '0 8px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer' }}
                                                        >
                                                            <Globe size={14} />
                                                        </button>
                                                        <div style={{ position: 'relative' }}>
                                                            <input
                                                                type="file"
                                                                id={`file-up-${img.id}`}
                                                                style={{ display: 'none' }}
                                                                accept="image/*"
                                                                onChange={(e) => handleFileUpload(e, selectedPageIndex, img.id)}
                                                            />
                                                            <button
                                                                onClick={() => document.getElementById(`file-up-${img.id}`)?.click()}
                                                                title="Kompüterdən yüklə"
                                                                style={{ padding: '0 8px', height: '100%', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                                            >
                                                                <Plus size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        placeholder="Alt mətni..."
                                                        value={img.alt}
                                                        onChange={(e) => handleImageAltChange(selectedPageIndex, img.id, e.target.value)}
                                                        style={{ fontSize: '0.75rem', width: '100%', padding: '0.4rem', border: '1px solid #eee', borderRadius: '4px' }}
                                                    />
                                                </div>
                                            </div>
                                        ))) : (
                                        <div className="empty-fields-tip" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
                                            {searchTerm ? 'Sorğuya uyğun şəkil tapılmadı.' : 'Bu bölmədə redaktə ediləcək şəkil yoxdur.'}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="field-group">
                                <label><ImageIcon size={16} /> Yeni Şəkil Yüklə</label>
                                <div className="upload-dropzone">
                                    <Plus size={24} />
                                    <p>Şəkil yükləmək üçün seçin</p>
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                        <button className="btn-secondary" onClick={() => {
                                            const input = document.createElement('input');
                                            input.type = 'file';
                                            input.accept = 'image/*';
                                            input.onchange = async (e) => {
                                                const file = (e.target as HTMLInputElement).files?.[0];
                                                if (!file) return;
                                                const url = await uploadImage(file);
                                                if (url) {
                                                    const newPages = [...pages];
                                                    const currentPage = newPages[selectedPageIndex];
                                                    const newId = `img-${currentPage.images.length}-${Date.now()}`;
                                                    currentPage.images.push({ id: newId, path: url, alt: '', type: 'local' });
                                                    setPages(newPages);
                                                    toast.success('Yeni şəkil əlavə edildi');
                                                }
                                            };
                                            input.click();
                                        }}>Cihazdan Yüklə</button>
                                        <button className="btn-secondary" onClick={() => {
                                            const dummyId = `img-${(currentPage.images || []).length}`;
                                            setActiveImageField({ pageIdx: selectedPageIndex, imgId: dummyId }); // Temporary for next add
                                            setIsAddingNewFromSystem(true);
                                            setIsImageSelectorOpen(true);
                                        }}>Kitabxanadan Seç</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            )
            }

            {
                isModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-card fade-in">
                            <div className="modal-header">
                                <h3>Yeni Bölmə Əlavə Et</h3>
                                <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
                            </div>
                            <div className="modal-body">
                                <div className="field-group">
                                    <label>Bölmə Başlığı</label>
                                    <input
                                        type="text"
                                        value={newSectionTitle}
                                        onChange={(e) => setNewSectionTitle(e.target.value)}
                                        placeholder="Məs: Xidmətlərimiz, Kampaniyalar..."
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Ləğv et</button>
                                <button className="btn-primary" onClick={addNewSection}>Əlavə et</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                isImageSelectorOpen && (
                    <div className="modal-overlay">
                        <div className="modal-card fade-in" style={{ maxWidth: '800px' }}>
                            <div className="modal-header">
                                <h3>Sistem Şəkilləri</h3>
                                <button onClick={() => setIsImageSelectorOpen(false)}><X size={20} /></button>
                            </div>
                            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                                <div className="image-selector-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem' }}>
                                    {allAvailableImages.length > 0 ? allAvailableImages.map((path, idx) => (
                                        <div
                                            key={idx}
                                            className="selector-image-card"
                                            onClick={() => selectImage(path)}
                                            style={{ cursor: 'pointer', border: '2px solid #f1f5f9', borderRadius: '12px', overflow: 'hidden', transition: 'all 0.2s' }}
                                        >
                                            <div style={{ aspectRatio: '1/1', background: '#f8fafc' }}>
                                                <img src={path} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                            <div style={{ padding: '0.5rem', fontSize: '10px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'center' }}>
                                                {path.split('/').pop()}
                                            </div>
                                        </div>
                                    )) : (
                                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                                            Sistemdə heç bir şəkil tapılmadı.
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn-secondary" onClick={() => setIsImageSelectorOpen(false)}>Bağla</button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default VisualEditor;
