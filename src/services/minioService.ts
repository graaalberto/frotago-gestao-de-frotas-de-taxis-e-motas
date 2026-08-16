import { apiClient } from './apiClient';
import { MinioFileUploadResponse } from '../types';

export class MinioService {
  /**
   * Faz upload de arquivo para a API Golang MinIO (https://github.com/graaalberto/graaa-golang-minio-api-file)
   * Suporta fotos de avarias, comprovativos de paragens, fotos de viaturas, avatares de motoristas e documentos.
   */
  public async uploadFile(
    file: File | Blob,
    bucket: 'avatars' | 'breakdowns' | 'stops' | 'vehicles' | 'documents' = 'documents',
    customFileName?: string
  ): Promise<MinioFileUploadResponse> {
    const config = apiClient.getConfig();
    const minioUrl = config.minioBaseUrl || 'http://localhost:8081';
    const fileName = customFileName || (file instanceof File ? file.name : `file_${Date.now()}.jpg`);

    if (config.useMockSimulation) {
      // Simulação local quando a API Golang Minio não estiver rodando no localhost
      await new Promise(r => setTimeout(r, 450));
      const simulatedUrl = `https://minio.frotago.ao/${bucket}/${Date.now()}_${fileName}`;
      return {
        status: 'success',
        message: 'Arquivo armazenado com sucesso no MinIO Bucket ' + bucket,
        fileId: `file_${Math.random().toString(36).substring(2, 9)}`,
        fileName,
        fileUrl: simulatedUrl,
        bucket,
        sizeBytes: file.size || 1024 * 150,
        mimeType: file.type || 'image/jpeg',
        uploadedAt: new Date().toISOString(),
      };
    }

    // Chamada real multipart/form-data para a API Golang MinIO
    const formData = new FormData();
    formData.append('file', file, fileName);
    formData.append('bucket', bucket);

    const startTime = Date.now();
    try {
      const token = apiClient.getToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${minioUrl}/api/files/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await res.json();
      const duration = Date.now() - startTime;

      apiClient.addLog({
        method: 'POST',
        endpoint: `${minioUrl}/api/files/upload`,
        status: res.status,
        durationMs: duration,
        requestBody: { bucket, fileName, size: file.size },
        responseBody: data,
      });

      if (!res.ok) {
        throw new Error(data.message || `Erro no upload MinIO: HTTP ${res.status}`);
      }

      return {
        status: 'success',
        fileId: data.fileId || data.id,
        fileName: data.fileName || fileName,
        fileUrl: data.fileUrl || data.url || `${minioUrl}/api/files/${bucket}/${fileName}`,
        bucket: data.bucket || bucket,
        sizeBytes: data.sizeBytes || file.size,
        mimeType: data.mimeType || file.type,
        uploadedAt: data.uploadedAt || new Date().toISOString(),
      };
    } catch (err: any) {
      apiClient.addLog({
        method: 'POST',
        endpoint: `${minioUrl}/api/files/upload`,
        status: 500,
        durationMs: Date.now() - startTime,
        error: err.message,
      });
      throw err;
    }
  }

  /**
   * Health check da API Golang MinIO
   */
  public async checkMinioHealth(): Promise<boolean> {
    const config = apiClient.getConfig();
    const minioUrl = config.minioBaseUrl || 'http://localhost:8081';

    if (config.useMockSimulation) {
      return true;
    }

    try {
      const res = await fetch(`${minioUrl}/api/health`, { method: 'GET' });
      return res.ok;
    } catch {
      return false;
    }
  }
}

export const minioService = new MinioService();
