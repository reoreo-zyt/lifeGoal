import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Config } from './entities/config.entity';

@Injectable()
export class ConfigService {
  constructor(
    @InjectRepository(Config)
    private configRepository: Repository<Config>,
  ) {}

  async getConfig(userId: number, key: string): Promise<string | null> {
    const config = await this.configRepository.findOne({ where: { userId, key } });
    return config ? config.value : null;
  }

  async setConfig(userId: number, key: string, value: string): Promise<Config> {
    let config = await this.configRepository.findOne({ where: { userId, key } });
    
    if (config) {
      config.value = value;
      return this.configRepository.save(config);
    } else {
      config = this.configRepository.create({ userId, key, value });
      return this.configRepository.save(config);
    }
  }

  async getConfigs(userId: number): Promise<{ [key: string]: string }> {
    const configs = await this.configRepository.find({ where: { userId } });
    const result: { [key: string]: string } = {};
    
    configs.forEach(config => {
      result[config.key] = config.value;
    });
    
    return result;
  }

  async setConfigs(userId: number, configs: { [key: string]: string }): Promise<void> {
    for (const [key, value] of Object.entries(configs)) {
      await this.setConfig(userId, key, value);
    }
  }
}