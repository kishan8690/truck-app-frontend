const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;

export const createApiCall = (fetchWithAuth: any) => {
  return async <T>({
    endpoint,
    method = "GET",
    data,
    params,
  }: {
    endpoint: string;
    method?: string;
    data?: any;
    params?: Record<string, any>;
  }): Promise<T> => {
    let url = `${BASE_URL}${endpoint}`;

    if (params) {
      const query = new URLSearchParams(params).toString();
      url += `?${query}`;
    }

    const res = await fetchWithAuth(url, {
      method,
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`${res.status} ${text}`);
    }

    return res.json();
  };
};
