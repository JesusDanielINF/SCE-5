export const apiService = {
  async login(credentials: { username: string; password: string }): Promise<User> {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await this.parseError(response);
      console.log('Error en el inicio de sesión:', errorData); // Agrega este log
      throw new Error(errorData.message || 'Credenciales inválidas');
    }

    return await response.json();
  },

  async register(userData: RegisterData): Promise<User> {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await this.parseError(response);
      throw new Error(errorData.message || 'Error en el registro');
    }

    return await response.json();
  },

  async logout(): Promise<void> {
    const response = await fetch('/api/logout', {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Error al cerrar sesión');
    }
  },

  async getCurrentUser  (): Promise<User | null> {
    try {
      const response = await fetch('/api/user');
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  },

  async parseError(response: Response) {
    try {
      const contentType = response.headers.get('Content-Type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        const text = await response.text(); // Obtener el texto en caso de que no sea JSON
        return { message: text || response.statusText };
      }
    } catch {
      return { message: response.statusText };
    }
  }
};

