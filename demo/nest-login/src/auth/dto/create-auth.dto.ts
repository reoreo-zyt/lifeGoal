import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateAuthDto {
  @ApiProperty({ description: '姓名' })
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsNotEmpty({ message: '姓名必填' })
  readonly username: string;

  @ApiProperty({ description: '密码' })
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsNotEmpty({ message: '密码必填' })
  password: string;
}
