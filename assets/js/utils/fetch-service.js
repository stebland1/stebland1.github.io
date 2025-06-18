class FetchService {
  /** @param {string} [baseURL] */
  constructor(baseURL = "") {
    this.baseURL = baseURL;
  }

  /** @param {string} endpoint */
  async get(endpoint) {
    try {
      const res = await fetch(`${this.baseURL}${endpoint}`);
      if (!res.ok) {
        throw new Error(`GET API Error status: ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      throw err;
    }
  }
}

export { FetchService };
