import request from 'supertest';

import { app } from 'test/utils/setup-file.util';

describe('Hello world', () => {
  it('must return hello world as text', async () => {
    const response = await request(app.getHttpServer()).get('');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Hello world');
  });
});
