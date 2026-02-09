const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs/promises');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

// Request Logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Path to the web data directory (JSON files, etc.)
const WEB_DATA_DIR = process.env.WEB_DATA_DIR || path.join(__dirname, '../front/public');
const FRONT_PUBLIC_DIR = WEB_DATA_DIR;
const SITE_CONTENT_PATH = path.join(WEB_DATA_DIR, 'site-content.json');
const ADMIN_PUBLIC_DIR = process.env.ADMIN_PUBLIC_DIR || path.join(__dirname, '../public');
const ADMIN_SITEMAP_PATH = path.join(ADMIN_PUBLIC_DIR, 'sitemap.json');

app.get('/', (req, res) => {
    res.send('Admin Backend is running!');
});

const UPLOAD_DIR_PATH = process.env.UPLOAD_DIR || path.join(FRONT_PUBLIC_DIR, 'uploads');
app.use('/uploads', express.static(UPLOAD_DIR_PATH));

// Ensure public directory exists
if (!fs.existsSync(FRONT_PUBLIC_DIR)) {
    fs.mkdirSync(FRONT_PUBLIC_DIR, { recursive: true });
}

if (!fs.existsSync(ADMIN_PUBLIC_DIR)) {
    fs.mkdirSync(ADMIN_PUBLIC_DIR, { recursive: true });
}

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR_PATH)) {
    fs.mkdirSync(UPLOAD_DIR_PATH, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR_PATH);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// API: Upload Image
app.post('/api/upload-image', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    // Return the path relative to the public directory
    const relativePath = `/uploads/${req.file.filename}`;
    res.json({ url: relativePath });
});

// API: Save Content
app.post('/api/save-content', async (req, res) => {
    try {
        const content = req.body;
        await fsPromises.writeFile(SITE_CONTENT_PATH, JSON.stringify(content, null, 2));
        res.json({ success: true });
    } catch (error) {
        console.error('Save error:', error);
        res.status(500).json({ error: 'Failed to save content' });
    }
});

const EVENTS_FILE_PATH = path.join(FRONT_PUBLIC_DIR, 'events.json');
const NEWS_FILE_PATH = path.join(FRONT_PUBLIC_DIR, 'news.json');
const COURSES_FILE_PATH = path.join(FRONT_PUBLIC_DIR, 'courses.json');
const GALLERY_PHOTOS_FILE_PATH = path.join(FRONT_PUBLIC_DIR, 'gallery-photos.json');
const VIDEOS_FILE_PATH = path.join(FRONT_PUBLIC_DIR, 'videos.json');
const USERS_FILE_PATH = path.join(WEB_DATA_DIR, 'users.json');

// API: Get Gallery Photos
app.get('/api/gallery-photos', async (req, res) => {
    try {
        try {
            await fsPromises.access(GALLERY_PHOTOS_FILE_PATH);
        } catch {
            return res.json([]);
        }
        const data = await fsPromises.readFile(GALLERY_PHOTOS_FILE_PATH, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error reading gallery photos:', error);
        res.status(500).json({ error: 'Failed to read gallery photos' });
    }
});

// API: Save Gallery Photos
app.post('/api/gallery-photos', async (req, res) => {
    try {
        const photos = req.body;
        await fsPromises.writeFile(GALLERY_PHOTOS_FILE_PATH, JSON.stringify(photos, null, 2));
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving gallery photos:', error);
        res.status(500).json({ error: 'Failed to save gallery photos' });
    }
});

// Helper: Get Users
const getUsers = async () => {
    try {
        await fsPromises.access(USERS_FILE_PATH);
        const data = await fsPromises.readFile(USERS_FILE_PATH, 'utf8');
        return JSON.parse(data);
    } catch {
        return [];
    }
};

// Helper: Save Users
const saveUsers = async (users) => {
    await fsPromises.writeFile(USERS_FILE_PATH, JSON.stringify(users, null, 2));
};

// API: Get Events
app.get('/api/events', async (req, res) => {
    try {
        try {
            await fsPromises.access(EVENTS_FILE_PATH);
        } catch {
            return res.json([]);
        }
        const data = await fsPromises.readFile(EVENTS_FILE_PATH, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error reading events:', error);
        res.status(500).json({ error: 'Failed to read events' });
    }
});

// API: Save Events
app.post('/api/events', async (req, res) => {
    try {
        const events = req.body;
        await fsPromises.writeFile(EVENTS_FILE_PATH, JSON.stringify(events, null, 2));
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving events:', error);
        res.status(500).json({ error: 'Failed to save events' });
    }
});

// API: Get News
app.get('/api/news', async (req, res) => {
    console.log('GET /api/news request received');
    try {
        try {
            await fsPromises.access(NEWS_FILE_PATH);
        } catch {
            return res.json([]);
        }
        const data = await fsPromises.readFile(NEWS_FILE_PATH, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error reading news:', error);
        res.status(500).json({ error: 'Failed to read news' });
    }
});
// API: Save News
app.post('/api/news', async (req, res) => {
    try {
        const news = req.body;
        await fsPromises.writeFile(NEWS_FILE_PATH, JSON.stringify(news, null, 2));
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving news:', error);
        res.status(500).json({ error: 'Failed to save news' });
    }
});

const VIDEOS_FILE_PATH = path.join(FRONT_PUBLIC_DIR, 'videos.json');

// API: Get Videos
app.get('/api/videos', async (req, res) => {
    try {
        try {
            await fsPromises.access(VIDEOS_FILE_PATH);
        } catch {
            return res.json([]);
        }
        const data = await fsPromises.readFile(VIDEOS_FILE_PATH, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error reading videos:', error);
        res.status(500).json({ error: 'Failed to read videos' });
    }
});

// API: Save Videos
app.post('/api/videos', async (req, res) => {
    try {
        const videos = req.body;
        await fsPromises.writeFile(VIDEOS_FILE_PATH, JSON.stringify(videos, null, 2));
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving videos:', error);
        res.status(500).json({ error: 'Failed to save videos' });
    }
});

const DRIVERS_FILE_PATH = path.join(FRONT_PUBLIC_DIR, 'drivers.json');

// API: Get Drivers
app.get('/api/drivers', async (req, res) => {
    try {
        try {
            await fsPromises.access(DRIVERS_FILE_PATH);
        } catch {
            return res.json([]);
        }
        const data = await fsPromises.readFile(DRIVERS_FILE_PATH, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error reading drivers:', error);
        res.status(500).json({ error: 'Failed to read drivers' });
    }
});

// API: Save Drivers with Automatic Ranking
app.post('/api/drivers', async (req, res) => {
    try {
        let categories = req.body;

        // Automatic Ranking Logic
        if (Array.isArray(categories)) {
            categories = categories.map(cat => {
                if (cat.drivers && Array.isArray(cat.drivers)) {
                    // Sort drivers by points descending
                    cat.drivers.sort((a, b) => (b.points || 0) - (a.points || 0));

                    // Reassign ranks based on sorted order
                    cat.drivers = cat.drivers.map((driver, index) => ({
                        ...driver,
                        rank: index + 1
                    }));
                }
                return cat;
            });
        }

        await fsPromises.writeFile(DRIVERS_FILE_PATH, JSON.stringify(categories, null, 2));
        res.json({ success: true, data: categories });
    } catch (error) {
        console.error('Error saving drivers:', error);
        res.status(500).json({ error: 'Failed to save drivers' });
    }
});

// API: Get Courses
app.get('/api/courses', async (req, res) => {
    try {
        try {
            await fsPromises.access(COURSES_FILE_PATH);
        } catch {
            return res.json([]);
        }
        const data = await fsPromises.readFile(COURSES_FILE_PATH, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error reading courses:', error);
        res.status(500).json({ error: 'Failed to read courses' });
    }
});

// API: Save Courses
app.post('/api/courses', async (req, res) => {
    try {
        const courses = req.body;
        await fsPromises.writeFile(COURSES_FILE_PATH, JSON.stringify(courses, null, 2));
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving courses:', error);
        res.status(500).json({ error: 'Failed to save courses' });
    }
});

// Logic from extractJsonMap.cjs
const isTrueText = (str) => {
    if (!str || typeof str !== 'string') return false;
    const trimmed = str.trim();
    if (trimmed.length < 2 || trimmed.length > 300) return false;

    // Must contain at least one letter (including Azerbaijani specific)
    if (!/[a-zA-ZəƏüÜöÖğĞıIçÇşŞ]/.test(trimmed)) return false;

    // Filter out common code characters/patterns
    if (/[{}<>;]/.test(trimmed)) return false;
    if (trimmed.includes('=>')) return false;
    if (trimmed.includes('=')) return false;
    if (trimmed.includes('(') && trimmed.includes(')')) return false; // functions/methods
    if (trimmed.startsWith('.') || trimmed.includes(' .')) return false; // method chaining
    if (trimmed.includes('/') && trimmed.split('/').length > 2) return false; // likely regex or path

    const codeKeywords = [
        'return ', 'import ', 'export ', 'function', 'const ', 'let ', 'var ',
        'void', 'REZERV', 'replace', 'map', 'filter', 'join', 'split',
        'true', 'false', 'null', 'undefined', 'NaN', 'string', 'number', 'any',
        'async', 'await', 'console.', 'process.'
    ];

    if (codeKeywords.some(kw => trimmed.toLowerCase().includes(kw.toLowerCase()))) return false;

    return true;
};

// API: Extract Content (Scan Frontend)
app.all('/api/extract-content', async (req, res) => {
    console.log('Starting Clean Content Extraction...');
    try {
        const COMPONENTS_DIR = path.join(__dirname, '../front/components');
        const pagesMap = new Map();

        // Load existing to potentially preserve IDs if needed, 
        // BUT user asked to rebuild extraction. 
        // We will prioritize fresh clean extraction.

        try {
            await fsPromises.access(COMPONENTS_DIR);
            const compFiles = await fsPromises.readdir(COMPONENTS_DIR);

            // Add App.tsx from root if exists
            const FRONT_DIR = path.join(__dirname, '../front');
            const allFiles = compFiles.map(f => path.join(COMPONENTS_DIR, f));
            if (await fsPromises.access(path.join(FRONT_DIR, 'App.tsx')).then(() => true).catch(() => false)) {
                allFiles.push(path.join(FRONT_DIR, 'App.tsx'));
            }

            const tsxFiles = allFiles.filter(f => f.endsWith('.tsx'));

            for (const file of tsxFiles) {
                try {
                    const filePath = file;
                    const content = await fsPromises.readFile(filePath, 'utf8');
                    const pageId = path.basename(file, '.tsx').toLowerCase();
                    const filenameBase = path.basename(file, '.tsx');

                    const AZ_TITLES = {
                        'about': 'HAQQIMIZDA',
                        'news': 'XƏBƏRLƏR',
                        'newspage': 'Xəbər Səhifəsi',
                        'eventspage': 'Tədbirlər Səhifəsi',
                        'driverspage': 'Sürücülər Səhifəsi',
                        'gallerypage': 'Qalereya',
                        'rulespage': 'Qaydalar',
                        'contactpage': 'Əlaqə Səhifəsi',
                        'categoryleaders': 'Kateqoriya Liderləri',
                        'footer': 'Sayt Sonu',
                        'hero': 'Giriş Hissəsi',
                        'marquee': 'Sürüşən Yazı',
                        'navbar': 'Naviqasiya',
                        'nextrace': 'Növbəti Yarış',
                        'partners': 'Tərəfdaşlar',
                        'videoarchive': 'Video Arxiv',
                        'whatisoffroad': 'Offroad Nədir?',
                        'home': 'ANA SƏHİFƏ',
                        'app': 'Ümumi Ayarlar'
                    };

                    const title = AZ_TITLES[pageId] || filenameBase;
                    const items = [];
                    const seenValues = new Set();

                    // Strip noise
                    const clean = content
                        .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1')
                        .replace(/import\s+.*?from\s+['"].*?['"];?/g, '')
                        .replace(/style=\{\{[\s\S]*?\}\}/g, '');

                    let match;

                    // 1. JSX Text
                    const jsxRegex = />([^<{}]+)</g;
                    while ((match = jsxRegex.exec(clean)) !== null) {
                        let text = match[1].trim().replace(/\s+/g, ' ');
                        if (isTrueText(text) && !seenValues.has(text)) {
                            seenValues.add(text);
                            const slug = text.slice(0, 15).toLowerCase().replace(/[^a-z0-9]+/g, '-');
                            items.push({
                                pos: match.index,
                                item: {
                                    id: `txt-${slug}-${Math.floor(Math.random() * 1000)}`,
                                    type: 'text',
                                    label: text.length > 20 ? text.slice(0, 20) + '...' : text.toUpperCase(),
                                    value: text
                                }
                            });
                        }
                    }

                    // 2. Attributes
                    const attrRegex = /\s(placeholder|title|alt|label)=(['"])(.*?)\2/g;
                    while ((match = attrRegex.exec(clean)) !== null) {
                        const attr = match[1];
                        const text = match[3];
                        if (isTrueText(text) && !seenValues.has(text)) {
                            seenValues.add(text);
                            const slug = text.slice(0, 15).toLowerCase().replace(/[^a-z0-9]+/g, '-');
                            items.push({
                                pos: match.index,
                                item: {
                                    id: `attr-${slug}-${Math.floor(Math.random() * 1000)}`,
                                    type: 'text',
                                    label: `${attr.toUpperCase()}: ${text.slice(0, 15)}...`,
                                    value: text
                                }
                            });
                        }
                    }

                    // 3. getText calls
                    const getTextRegex = /getText\s*\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*\)/g;
                    while ((match = getTextRegex.exec(clean)) !== null) {
                        const key = match[1];
                        const text = match[2];
                        if (isTrueText(text) && !seenValues.has(text)) {
                            seenValues.add(text);
                            items.push({
                                pos: match.index,
                                item: {
                                    id: key,
                                    type: 'text',
                                    label: `KEY: ${key}`,
                                    value: text
                                }
                            });
                        }
                    }

                    // 4. Quoted strings (Natural Language)
                    const quotedRegex = /(['"])([A-ZƏÜÖĞIÇŞ][^'"]{3,})\1/g;
                    while ((match = quotedRegex.exec(clean)) !== null) {
                        const text = match[2];
                        const isTechnical = /^[a-z]+[A-Z]/.test(text) || text.includes('/') || text.includes('{');
                        if (isTrueText(text) && !seenValues.has(text) && !isTechnical) {
                            seenValues.add(text);
                            const slug = text.slice(0, 15).toLowerCase().replace(/[^a-z0-9]+/g, '-');
                            items.push({
                                pos: match.index,
                                item: {
                                    id: `lbl-${slug}-${Math.floor(Math.random() * 1000)}`,
                                    type: 'text',
                                    label: text.length > 20 ? text.slice(0, 20) + '...' : text,
                                    value: text
                                }
                            });
                        }
                    }

                    // 5. Images
                    const imgRegex = /src\s*=\s*(['"])(.*?)\1/g;
                    while ((match = imgRegex.exec(clean)) !== null) {
                        const src = match[2];
                        if (src.match(/\.(png|jpg|jpeg|svg|webp|gif)/i) || src.startsWith('http')) {
                            items.push({
                                pos: match.index,
                                item: {
                                    id: `img-${Math.floor(Math.random() * 1000)}`,
                                    path: src,
                                    alt: 'Bölmədəki Şəkil',
                                    type: 'local'
                                }
                            });
                        }
                    }

                    items.sort((a, b) => a.pos - b.pos);
                    const sections = items.filter(i => i.item.type === 'text').map(i => i.item);
                    const images = items.filter(i => i.item.path).map(i => i.item);

                    if (sections.length > 0 || images.length > 0) {
                        pagesMap.set(pageId, {
                            id: pageId,
                            title: title,
                            sections: sections,
                            images: images
                        });
                    }
                } catch (fileErr) {
                    console.error(`Failed to scan file ${file}:`, fileErr);
                }
            }

        } catch (err) {
            console.error('Error reading components directory:', err);
        }

        const newContent = Array.from(pagesMap.values());

        // Custom Sort order for popular pages
        const orderWeight = {
            'home': 1, 'about': 2, 'news': 3, 'newspage': 4,
            'events': 5, 'eventspage': 6, 'drivers': 7,
            'driverspage': 8, 'gallery': 9, 'gallerypage': 10,
            'rules': 11, 'rulespage': 12, 'contact': 13, 'contactpage': 14
        };

        newContent.sort((a, b) => (orderWeight[a.id] || 100) - (orderWeight[b.id] || 100));

        await fsPromises.writeFile(SITE_CONTENT_PATH, JSON.stringify(newContent, null, 2));

        // GENERATE SITEMAP (Page-Based Grouping)
        const sitemap = [
            { title: 'DASHBOARD', icon: 'Layout', path: '/' },
            {
                title: 'ANA SƏHİFƏ',
                icon: 'Home',
                children: [
                    { title: 'Ümumi Görünüş', path: '/?page=home', icon: 'Layout' },
                    { title: 'Naviqasiya', path: '/?page=navbar', icon: 'Menu' },
                    { title: 'Giriş Hissəsi', path: '/?page=hero', icon: 'Maximize' },
                    { title: 'Sürüşən Yazı', path: '/?page=marquee', icon: 'Type' },
                    { title: 'Kateqoriya Liderləri', path: '/?page=categoryleaders', icon: 'Star' },
                    { title: 'Sayt Sonu', path: '/?page=footer', icon: 'Anchor' }
                ]
            },
            {
                title: 'HAQQIMIZDA',
                icon: 'Info',
                children: [
                    { title: 'Ümumi Məlumat', path: '/?page=about', icon: 'FileText' }
                ]
            },
            {
                title: 'XƏBƏRLƏR',
                icon: 'FileText',
                children: [
                    { title: 'Xəbər Siyahısı', path: '/?mode=news', icon: 'List' },
                    { title: 'Xəbər Səhifəsi', path: '/?page=newspage', icon: 'Layout' }
                ]
            },
            {
                title: 'TƏDBİRLƏR',
                icon: 'Calendar',
                children: [
                    { title: 'Tədbir Təqvimi', path: '/?mode=events', icon: 'Clock' },
                    { title: 'Tədbir Səhifəsi', path: '/?page=eventspage', icon: 'Layout' }
                ]
            },
            {
                title: 'SÜRÜCÜLƏR',
                icon: 'Trophy',
                children: [
                    { title: 'Sürücü Reytinqi', path: '/?mode=drivers', icon: 'Award' },
                    { title: 'Sürücülər Səhifəsi', path: '/?page=driverspage', icon: 'Layout' }
                ]
            },
            {
                title: 'QALEREYA',
                icon: 'Image',
                children: [
                    { title: 'Video Arxivi', path: '/?mode=videos', icon: 'Video' },
                    { title: 'Foto Arxiv', path: '/?mode=photos', icon: 'Image' },
                    { title: 'Qalereya Səhifəsi', path: '/?page=gallerypage', icon: 'Layout' }
                ]
            },
            {
                title: 'QAYDALAR',
                icon: 'Shield',
                children: [
                    { title: 'Qaydalar Səhifəsi', path: '/?page=rulespage', icon: 'Layout' }
                ]
            },
            {
                title: 'ƏLAQƏ',
                icon: 'Phone',
                children: [
                    { title: 'Əlaqə Səhifəsi', path: '/?page=contactpage', icon: 'Layout' }
                ]
            },
            { title: 'KURS İDARƏETMƏSİ', icon: 'BookOpen', path: '/courses' },
            { title: 'ADMİN HESABLARI', icon: 'Users', path: '/users-management' },
            { title: 'SİSTEM AYARLARI', icon: 'Settings', path: '/frontend-settings' }
        ];

        try {
            await fsPromises.writeFile(ADMIN_SITEMAP_PATH, JSON.stringify(sitemap, null, 2));
            console.log('Sitemap generated successfully.');
        } catch (err) {
            console.error('Failed to write sitemap:', err);
        }

        const stats = {
            total: newContent.length,
            sections: newContent.reduce((acc, p) => acc + p.sections.length, 0),
            images: newContent.reduce((acc, p) => acc + p.images.length, 0)
        };

        console.log(`Extraction complete. Pages: ${stats.total}, Sections: ${stats.sections}, Images: ${stats.images}`);

        // Return structured data with stats
        res.json({
            pages: newContent,
            stats: stats,
            sitemap: sitemap
        });

    } catch (error) {
        console.error('Extraction error:', error);
        res.status(500).json({ error: 'Internal Server Error during extraction' });
    }
});

// API: Get Content
app.get('/api/get-content', async (req, res) => {
    try {
        try {
            await fsPromises.access(SITE_CONTENT_PATH);
        } catch {
            return res.json([]);
        }
        const data = await fsPromises.readFile(SITE_CONTENT_PATH, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(500).json({ error: 'Failed to read content' });
    }
});

// API: Get Sitemap
app.get('/api/sitemap', async (req, res) => {
    try {
        let sitemap = [];
        try {
            await fsPromises.access(ADMIN_SITEMAP_PATH);
            const data = await fsPromises.readFile(ADMIN_SITEMAP_PATH, 'utf8');
            sitemap = JSON.parse(data);
        } catch {
            // Default sitemap if file doesn't exist
            sitemap = [
                { title: 'Dashboard', icon: 'Layout', path: '/' },
                { title: 'Kurs İdarəetməsi', icon: 'BookOpen', path: '/courses' }
            ];
        }

        // Ensure Admin Management and Settings are always present for the frontend to filter
        const coreLinks = [
            { title: 'Admin Hesabları', icon: 'Users', path: '/users-management' },
            { title: 'Sistem Ayarları', icon: 'Settings', path: '/frontend-settings' }
        ];

        coreLinks.forEach(link => {
            if (!sitemap.find(item => item.path === link.path)) {
                sitemap.push(link);
            }
        });

        res.json(sitemap);
    } catch (error) {
        console.error('Sitemap read error:', error);
        res.status(500).json({ error: 'Failed to read sitemap' });
    }
});

// API: Get All Images
app.get('/api/all-images', (req, res) => {
    try {
        // Simple scan for images in public dir
        const scanDir = (dir, list = []) => {
            if (!fs.existsSync(dir)) return list;
            const files = fs.readdirSync(dir);
            for (const f of files) {
                const full = path.join(dir, f);
                const stat = fs.statSync(full);
                if (stat.isDirectory()) {
                    if (f !== 'node_modules' && f !== '.git') scanDir(full, list);
                } else if (/\.(png|jpe?g|svg|webp|gif)$/i.test(f)) {
                    list.push(full.replace(FRONT_PUBLIC_DIR, ''));
                }
            }
            return list;
        };
        const images = scanDir(FRONT_PUBLIC_DIR);
        res.json({ local: images });
    } catch (e) {
        res.json({ local: [] });
    }
});

app.post('/api/frontend/action', (req, res) => {
    res.json({ status: 'running' }); // Dummy for now
});

const os = require('os');

app.get('/api/frontend/status', (req, res) => {
    // CPU Load (approximate)
    const cpus = os.cpus();
    const load = os.loadavg()[0]; // 1 minute load average
    const cpuPercentage = Math.min(100, Math.round((load / cpus.length) * 100));

    // RAM Usage
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const ramPercentage = Math.round((usedMem / totalMem) * 100);
    const usedGB = (usedMem / (1024 * 1024 * 1024)).toFixed(1);
    const totalGB = (totalMem / (1024 * 1024 * 1024)).toFixed(1);

    // Uptime
    const uptime = os.uptime();
    const days = Math.floor(uptime / (3600 * 24));
    const hours = Math.floor((uptime % (3600 * 24)) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const uptimeStr = `${days}d ${hours}h ${minutes}m`;

    res.json({
        status: 'running',
        port: 5173,
        stats: {
            cpu: cpuPercentage,
            ram: {
                total: parseFloat(totalGB),
                used: parseFloat(usedGB),
                percentage: ramPercentage
            },
            versions: {
                project: 'v1.1.0',
                node: process.version,
                vite: 'v5.1.4'
            },
            uptime: uptimeStr
        }
    });
});

// API: Get Users
app.get('/api/users', async (req, res) => {
    const users = await getUsers();
    const safeUsers = users.map(({ password, ...u }) => u);
    res.json(safeUsers);
});

// API: Save User (Create or Update)
app.post('/api/users', async (req, res) => {
    const userData = req.body;
    const users = await getUsers();

    if (userData.id) {
        // Update existing
        const index = users.findIndex(u => u.id === userData.id);
        if (index !== -1) {
            // Keep old password if new one is empty
            if (!userData.password) {
                userData.password = users[index].password;
            }
            users[index] = { ...users[index], ...userData };
        }
    } else {
        // Create new
        const newUser = {
            ...userData,
            id: Date.now()
        };
        users.push(newUser);
    }

    await saveUsers(users);
    res.json({ success: true });
});

// API: Delete User
app.delete('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    let users = await getUsers();

    // Prevent deleting the last master admin
    const userToDelete = users.find(u => u.id == id);
    if (userToDelete?.role === 'master') {
        const otherMasters = users.filter(u => u.role === 'master' && u.id != id);
        if (otherMasters.length === 0) {
            return res.status(400).json({ error: 'Sonuncu Master Admini silə bilməzsiniz' });
        }
    }

    users = users.filter(u => u.id != id);
    await saveUsers(users);
    res.json({ success: true });
});

// API: Check if setup is needed
app.get('/api/check-setup', async (req, res) => {
    const users = await getUsers();
    res.json({ needsSetup: users.length === 0 });
});

// API: Setup initial Master Admin
app.post('/api/setup', async (req, res) => {
    const { username, password, name } = req.body;
    const users = await getUsers();

    if (users.length > 0) {
        return res.status(400).json({ success: false, error: 'Sistem artıq quraşdırılıb' });
    }

    const newUser = {
        id: Date.now(),
        username,
        password, // In a production app, use hashing here
        name,
        role: 'master'
    };

    await saveUsers([newUser]);
    res.json({ success: true, user: { id: newUser.id, username: newUser.username, name: newUser.name, role: newUser.role } });
});

// API: Authentication
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const users = await getUsers();

    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        const { password, ...userWithoutPassword } = user;
        res.json({ success: true, user: userWithoutPassword });
    } else {
        res.status(401).json({ success: false, error: 'İstifadəçi adı və ya şifrə yanlışdır' });
    }
});

app.listen(PORT, () => {
    console.log(`Admin Backend running at http://localhost:${PORT}`);
});
