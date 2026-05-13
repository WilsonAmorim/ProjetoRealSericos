import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import osRoutes from '../../../src/infrastructure/routes/osRoutes';
import { errorHandler } from '../../../src/middlewares/errorHandler';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(express.json());
app.use('/api/os', osRoutes);
app.use(errorHandler);

describe('OS Routes - Multer Uploads', () => {
  const testImagePath = path.join(__dirname, 'test-image.jpg');

  beforeEach(() => {
    // Create a dummy file for testing uploads
    if (!fs.existsSync(testImagePath)) {
      fs.writeFileSync(testImagePath, 'dummy image content');
    }
  });

  it('should upload photos and return 201', async () => {
    const res = await request(app)
      .post('/api/os')
      .field('id_motor', 1)
      .field('observacoes_gerais', 'Motor queimado')
      .attach('fotos_queima', testImagePath); // Attach the mock file

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.fotos.length).toBe(1);
    expect(res.body.data.observacoes_gerais).toBe('Motor queimado');
  });

  it('should reject non-image files', async () => {
    const testTextPath = path.join(__dirname, 'test-doc.txt');
    fs.writeFileSync(testTextPath, 'Not an image');

    const res = await request(app)
      .post('/api/os')
      .field('id_motor', 1)
      .attach('fotos_queima', testTextPath);

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
    expect(res.body.message).toContain('Not an image');
  });
});
