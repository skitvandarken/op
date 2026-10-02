import { Injectable } from '@angular/core';

interface WebDiskUploadPayload {
  files?: string[];
  urls?: string[];
  images?: string[];
  imageUrls?: string[];
  data?: string[];
  result?: string[];
  url?: string;
}

@Injectable({ providedIn: 'root' })
export class WebDiskService {
  private getUploadUrl(): string {
    return (window as Window & { __WEBDISK_UPLOAD_URL__?: string }).__WEBDISK_UPLOAD_URL__ ?? '';
  }

  private getUsername(): string {
    return (window as Window & { __WEBDISK_USERNAME__?: string }).__WEBDISK_USERNAME__ ?? '';
  }

  private getPassword(): string {
    return (window as Window & { __WEBDISK_PASSWORD__?: string }).__WEBDISK_PASSWORD__ ?? '';
  }

  private getAuthHeaders(): Record<string, string> {
    const username = this.getUsername();
    const password = this.getPassword();

    if (!username || !password) {
      return {};
    }

    const raw = `${username}:${password}`;
    const token = btoa(raw);
    return {
      Authorization: `Basic ${token}`,
    };
  }

  async uploadFiles(files: File[]): Promise<string[]> {
    if (!files.length) {
      return [];
    }

    const uploadUrl = this.getUploadUrl();
    if (!uploadUrl) {
      throw new Error('Defina window.__WEBDISK_UPLOAD_URL__ com o endpoint do WebDisk antes de fazer upload.');
    }

    const baseUrl = uploadUrl.replace(/\/$/, '');
    const uploadedUrls: string[] = [];

    for (const file of files) {
      const fileName = encodeURIComponent(file.name);
      const fileUrl = `${baseUrl}/${fileName}`;

      const response = await fetch(fileUrl, {
        method: 'PUT',
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': file.type || 'application/octet-stream',
        },
        body: file,
      });

      if (!response.ok && response.status !== 201) {
        const payload = await response.text();
        throw new Error(`Falha ao enviar imagem para o WebDisk. ${payload || 'Resposta inválida do servidor.'}`);
      }

      uploadedUrls.push(fileUrl);
    }

    return uploadedUrls;
  }

  private extractUrls(payload: unknown): string[] {
    if (Array.isArray(payload)) {
      return payload
        .filter((value): value is string => typeof value === 'string')
        .map((value) => value.trim())
        .filter(Boolean);
    }

    if (payload && typeof payload === 'object') {
      const obj = payload as WebDiskUploadPayload;
      const candidates = [obj.files, obj.urls, obj.images, obj.imageUrls, obj.data, obj.result, obj.url];

      for (const candidate of candidates) {
        if (Array.isArray(candidate)) {
          return candidate
            .filter((value): value is string => typeof value === 'string')
            .map((value) => value.trim())
            .filter(Boolean);
        }

        if (typeof candidate === 'string' && candidate.trim()) {
          return this.extractUrlsFromText(candidate);
        }
      }
    }

    if (typeof payload === 'string') {
      return this.extractUrlsFromText(payload);
    }

    throw new Error('Resposta do WebDisk sem URLs válidas.');
  }

  private extractUrlsFromText(value: string): string[] {
    const matches = value.match(/https?:\/\/[^\s'"<>]+/gi) ?? [];
    return [...new Set(matches.map((url) => url.trim()).filter(Boolean))];
  }
}
