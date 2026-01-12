import type { StringValue } from 'ms';

export const jwtConstants: { secret: string; expiresIn: StringValue } = {
  secret: 'leeKey', // 密钥
  expiresIn: '1DAYS', // token有效时间
};
