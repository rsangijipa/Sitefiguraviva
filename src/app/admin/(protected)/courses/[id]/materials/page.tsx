
import { db } from '@/lib/firebase/admin';
import { MaterialManager } from '@/components/admin/courses/MaterialManager';

export default async function CourseMaterialsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    // In Next 15 params is promise.

    // Fetch Materials server-side
    const materialsSnap = await db.collection('courses').doc(id).collection('materials').orderBy('createdAt', 'desc').get();
    const materials = materialsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    return <MaterialManager courseId={id} initialMaterials={materials} />;
}
