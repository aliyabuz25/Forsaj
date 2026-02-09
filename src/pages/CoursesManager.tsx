import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { BookOpen, Plus, Trash2, Edit, Users, Video, FileText, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import './CoursesManager.css';

interface Lesson {
    id: number;
    title: string;
    duration: string;
    videoUrl?: string;
    content: string;
    order: number;
}

interface Course {
    id: string | number; // Support both local numeric and Supabase UUID IDs
    title: string;
    description: string;
    instructor: string;
    thumbnail: string;
    price: number;
    students: number;
    lessons: Lesson[];
    status: 'active' | 'draft' | 'archived';
    createdAt: string;
}

const CoursesManager: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'list' | 'edit'>('list');

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                // Map DB names to interface names if different
                const mappedData = data.map(item => ({
                    ...item,
                    instructor: item.instructor || 'Naməlum',
                    thumbnail: item.image || item.thumbnail,
                    price: parseFloat(item.price) || 0,
                    lessons: Array.isArray(item.lessons) ? item.lessons : []
                }));
                setCourses(mappedData);
            }
        } catch (error: any) {
            console.error('Failed to load courses:', error);
            toast.error('Kurslar yüklənərkən xəta baş verdi');
        } finally {
            setIsLoading(false);
        }
    };

    const saveCourses = async () => {
        try {
            const toastId = toast.loading('Yadda saxlanılır...');

            // Format data for DB
            const dataToSave = courses.map(c => ({
                id: typeof c.id === 'number' ? undefined : c.id, // Let DB generate UUID for new items
                title: c.title,
                description: c.description,
                instructor: c.instructor,
                image: c.thumbnail,
                price: c.price.toString(),
                status: c.status,
                lessons: c.lessons
            }));

            const { error } = await supabase
                .from('courses')
                .upsert(dataToSave);

            if (error) throw error;

            toast.success('Kurslar yadda saxlanıldı!', { id: toastId });
            await loadCourses(); // Refresh to get proper UUIDs
        } catch (error: any) {
            toast.error(`Saxlama xətası: ${error.message}`);
        }
    };

    const addNewCourse = () => {
        const newCourse: Course = {
            id: Date.now(),
            title: 'Yeni Kurs',
            description: 'Kurs təsviri...',
            instructor: 'Müəllim adı',
            thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
            price: 0,
            students: 0,
            lessons: [],
            status: 'draft',
            createdAt: new Date().toISOString()
        };
        setCourses([...courses, newCourse]);
        setSelectedCourse(newCourse);
        setViewMode('edit');
        toast.success('Yeni kurs yaradıldı');
    };

    const deleteCourse = (id: string | number) => {
        if (window.confirm('Bu kursu silmək istədiyinizə əminsiniz?')) {
            setCourses(courses.filter(c => c.id !== id));
            if (selectedCourse?.id === id) {
                setSelectedCourse(null);
                setViewMode('list');
            }
            toast.success('Kurs silindi');
        }
    };

    const addLesson = () => {
        if (!selectedCourse) return;

        const newLesson: Lesson = {
            id: Date.now(),
            title: 'Yeni Dərs',
            duration: '10:00',
            content: '',
            order: selectedCourse.lessons.length + 1
        };

        const updatedCourse = {
            ...selectedCourse,
            lessons: [...selectedCourse.lessons, newLesson]
        };

        setSelectedCourse(updatedCourse);
        setCourses(courses.map((c: Course) => c.id === updatedCourse.id ? updatedCourse : c));
        toast.success('Yeni dərs əlavə edildi');
    };

    const updateCourse = (field: keyof Course, value: any) => {
        if (!selectedCourse) return;

        const updated = { ...selectedCourse, [field]: value };
        setSelectedCourse(updated);
        setCourses(courses.map((c: Course) => c.id === updated.id ? updated : c));
    };

    const updateLesson = (lessonId: number, field: keyof Lesson, value: any) => {
        if (!selectedCourse) return;

        const updatedLessons = selectedCourse.lessons.map(l =>
            l.id === lessonId ? { ...l, [field]: value } : l
        );

        const updatedCourse = { ...selectedCourse, lessons: updatedLessons };
        setSelectedCourse(updatedCourse);
        setCourses(courses.map((c: Course) => c.id === updatedCourse.id ? updatedCourse : c));
    };

    const deleteLesson = (lessonId: number) => {
        if (!selectedCourse) return;

        const updatedLessons = selectedCourse.lessons.filter(l => l.id !== lessonId);
        const updatedCourse = { ...selectedCourse, lessons: updatedLessons };

        setSelectedCourse(updatedCourse);
        setCourses(courses.map((c: Course) => c.id === updatedCourse.id ? updatedCourse : c));
        toast.success('Dərs silindi');
    };

    if (isLoading) {
        return <div className="loading-state">Yüklənir...</div>;
    }

    return (
        <div className="courses-manager fade-in">
            <div className="courses-header">
                <div>
                    <h1><BookOpen size={28} /> Kurs İdarəetməsi</h1>
                    <p>Tədris materiallarını və dərsləri idarə edin</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn-secondary" onClick={() => setViewMode('list')}>
                        Siyahı
                    </button>
                    <button className="btn-primary" onClick={addNewCourse}>
                        <Plus size={18} /> Yeni Kurs
                    </button>
                    <button className="btn-save" onClick={saveCourses}>
                        Yadda Saxla
                    </button>
                </div>
            </div>

            {viewMode === 'list' ? (
                <div className="courses-grid">
                    {courses.length === 0 ? (
                        <div className="empty-state">
                            <BookOpen size={64} style={{ opacity: 0.2 }} />
                            <h3>Hələ heç bir kurs yoxdur</h3>
                            <p>Yeni kurs yaratmaq üçün "Yeni Kurs" düyməsini basın</p>
                        </div>
                    ) : (
                        courses.map((course: Course) => (
                            <div key={course.id} className="course-card">
                                <div className="course-thumbnail">
                                    <img src={course.thumbnail} alt={course.title} />
                                    <span className={`status-badge ${course.status}`}>
                                        {course.status === 'active' ? 'Aktiv' : course.status === 'draft' ? 'Qaralama' : 'Arxiv'}
                                    </span>
                                </div>
                                <div className="course-info">
                                    <h3>{course.title}</h3>
                                    <p className="instructor">
                                        <Users size={14} /> {course.instructor}
                                    </p>
                                    <p className="description">{course.description}</p>
                                    <div className="course-meta">
                                        <span><Video size={14} /> {course.lessons.length} dərs</span>
                                        <span><Users size={14} /> {course.students} tələbə</span>
                                        <span className="price">{course.price} ₼</span>
                                    </div>
                                </div>
                                <div className="course-actions">
                                    <button
                                        className="btn-edit"
                                        onClick={() => {
                                            setSelectedCourse(course);
                                            setViewMode('edit');
                                        }}
                                    >
                                        <Edit size={16} /> Redaktə
                                    </button>
                                    <button
                                        className="btn-delete"
                                        onClick={() => deleteCourse(course.id)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : selectedCourse ? (
                <div className="course-editor">
                    <div className="editor-sidebar">
                        <h3>Kurs Məlumatları</h3>
                        <div className="form-group">
                            <label>Kurs Adı</label>
                            <input
                                type="text"
                                value={selectedCourse.title}
                                onChange={(e) => updateCourse('title', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Təsvir</label>
                            <textarea
                                value={selectedCourse.description}
                                onChange={(e) => updateCourse('description', e.target.value)}
                                rows={4}
                            />
                        </div>
                        <div className="form-group">
                            <label>Müəllim</label>
                            <input
                                type="text"
                                value={selectedCourse.instructor}
                                onChange={(e) => updateCourse('instructor', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Qiymət (₼)</label>
                            <input
                                type="number"
                                value={selectedCourse.price}
                                onChange={(e) => updateCourse('price', parseFloat(e.target.value))}
                            />
                        </div>
                        <div className="form-group">
                            <label>Status</label>
                            <select
                                value={selectedCourse.status}
                                onChange={(e) => updateCourse('status', e.target.value)}
                            >
                                <option value="draft">Qaralama</option>
                                <option value="active">Aktiv</option>
                                <option value="archived">Arxiv</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Thumbnail URL</label>
                            <input
                                type="text"
                                value={selectedCourse.thumbnail}
                                onChange={(e) => updateCourse('thumbnail', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="editor-main">
                        <div className="lessons-header">
                            <h3><Video size={20} /> Dərslər ({selectedCourse.lessons.length})</h3>
                            <button className="btn-primary" onClick={addLesson}>
                                <Plus size={16} /> Yeni Dərs
                            </button>
                        </div>

                        <div className="lessons-list">
                            {selectedCourse.lessons.length === 0 ? (
                                <div className="empty-lessons">
                                    <FileText size={48} style={{ opacity: 0.2 }} />
                                    <p>Hələ heç bir dərs yoxdur</p>
                                </div>
                            ) : (
                                selectedCourse.lessons.map((lesson: Lesson, index: number) => (
                                    <div key={lesson.id} className="lesson-item">
                                        <div className="lesson-number">{index + 1}</div>
                                        <div className="lesson-content">
                                            <input
                                                type="text"
                                                className="lesson-title"
                                                value={lesson.title}
                                                onChange={(e) => updateLesson(lesson.id, 'title', e.target.value)}
                                                placeholder="Dərs başlığı"
                                            />
                                            <div className="lesson-meta">
                                                <div className="meta-item">
                                                    <Clock size={14} />
                                                    <input
                                                        type="text"
                                                        value={lesson.duration}
                                                        onChange={(e) => updateLesson(lesson.id, 'duration', e.target.value)}
                                                        placeholder="10:00"
                                                    />
                                                </div>
                                                <div className="meta-item">
                                                    <Video size={14} />
                                                    <input
                                                        type="text"
                                                        value={lesson.videoUrl || ''}
                                                        onChange={(e) => updateLesson(lesson.id, 'videoUrl', e.target.value)}
                                                        placeholder="Video URL"
                                                    />
                                                </div>
                                            </div>
                                            <textarea
                                                className="lesson-description"
                                                value={lesson.content}
                                                onChange={(e) => updateLesson(lesson.id, 'content', e.target.value)}
                                                placeholder="Dərs məzmunu və qeydlər..."
                                                rows={3}
                                            />
                                        </div>
                                        <button
                                            className="btn-delete-lesson"
                                            onClick={() => deleteLesson(lesson.id)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default CoursesManager;
