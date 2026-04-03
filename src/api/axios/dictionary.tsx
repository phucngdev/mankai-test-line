import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export interface KanjiDictionary {
  id: string;
  name: string;
  description: string;
}

interface FetchKanjiParams {
  limit?: number;
  offset?: number;
  search?: string;
  order?: string;
}

export const fetchKanjiDictionaries = async (params: FetchKanjiParams = {}) => {
  try {
    const response = await axios.get(`${API_URL}kanji-dictionaries`, {
      params: {
        limit: params.limit ?? 10,
        offset: params.offset ?? 0,
        order: params.order,
        search: params.search,
      },
    });

    return response.data.data.items;
  } catch (error) {
    console.error('Failed to fetch kanji dictionaries:', error);
    throw error;
  }
};
