export const configService = {
    get: () => {
        const saved = localStorage.getItem('googleConfig');
        return saved ? JSON.parse(saved) : {
            calendarId: "pt.brazilian#holiday@group.v.calendar.google.com",
            driveFolderId: "folder_id_123456789",
            formsUrl: "https://docs.google.com/forms/u/0/...",
            youtubeId: "channel_id_XYZ"
        };
    },
    save: (config) => {
        localStorage.setItem('googleConfig', JSON.stringify(config));
    }
};
