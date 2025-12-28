export const configService = {
    get: () => {
        if (typeof window === 'undefined') {
            return {
                calendarId: "pt.brazilian#holiday@group.v.calendar.google.com",
                driveFolderId: "folder_id_123456789",
                formsUrl: "https://docs.google.com/forms/u/0/...",
                youtubeId: "channel_id_XYZ"
            };
        }
        const saved = localStorage.getItem('googleConfig');
        return saved ? JSON.parse(saved) : {
            calendarId: "pt.brazilian#holiday@group.v.calendar.google.com",
            driveFolderId: "folder_id_123456789",
            formsUrl: "https://docs.google.com/forms/u/0/...",
            youtubeId: "channel_id_XYZ"
        };
    },
    save: (config) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('googleConfig', JSON.stringify(config));
        }
    }
};
