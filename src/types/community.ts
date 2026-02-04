


export type ChannelType = 'general' | 'announcements' | 'qa' | 'projects';

export interface Author {
    uid: string;
    displayName: string;
    photoURL?: string;
    role: 'student' | 'instructor' | 'admin';
}

export interface Post {
    id: string;
    courseId?: string; // Optional: linked to specific course, or null for global
    channel: ChannelType;

    title: string;
    content: string; // Markdown or plain text
    author: Author;

    // Engagement
    likesCount: number;
    commentsCount: number;

    // Status
    isPinned?: boolean;
    isLocked?: boolean;

    createdAt: any;
    updatedAt: any;
}

export interface Comment {
    id: string;
    postId: string;
    content: string;
    author: Author;

    likesCount: number;

    createdAt: any;
    updatedAt: any;
}
