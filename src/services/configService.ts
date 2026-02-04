export interface GoogleConfig {
    calendarId: string;
    driveFolderId: string;
    formsUrl: string;
    youtubeId: string;
}

const DEFAULT_CONFIG: GoogleConfig = {
    calendarId: "pt.brazilian#holiday@group.v.calendar.google.com",
    driveFolderId: "folder_id_123456789",
    formsUrl: "https://docs.google.com/forms/u/0/...",
    youtubeId: "channel_id_XYZ"
};

export const configService = {
    get: (): GoogleConfig => {
        if (typeof window === 'undefined') {
            return DEFAULT_CONFIG;
        }
        const saved = localStorage.getItem('googleConfig');
        return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
    },
    save: (config: GoogleConfig): void => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('googleConfig', JSON.stringify(config));
        }
    }
};
