import api from './api';

export const mailApi = {
    getMails: async (userId, filter) => {
        try {
            let url = `/mails?userId=${userId}`;
            if (filter && filter !== 'all') {
                url += `&filter=${filter}`;
            }
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            console.error('Error fetching mails:', error);
            throw error;
        }
    },

    markAsRead: async (mailId) => {
        try {
            const response = await api.put(`/mails/${mailId}/read`);
            return response.data;
        } catch (error) {
            console.error('Error marking mail as read:', error);
            throw error;
        }
    },

    getGmailMails: async (userId) => {
        try {
            const response = await api.get(`/mails/gmail?userId=${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching Gmail mails:', error);
            throw error;
        }
    }
};
