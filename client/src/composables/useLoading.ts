// useLoading.js
import { ref } from 'vue';

export function useLoading() {
    const isLoading = ref(false);

    const startLoading = () => {
        isLoading.value = true;
    };

    const stopLoading = () => {
        isLoading.value = false;
    };

    const withLoading = async (promise) => {
        startLoading();
        try {
            return await promise;
        } finally {
            stopLoading();
        }
    };

    return {
        isLoading,
        startLoading,
        stopLoading,
        withLoading,
    };
}