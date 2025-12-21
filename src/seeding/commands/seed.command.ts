import { Command, CommandRunner } from 'nest-commander';
import { CategoriesSeeder } from '../categories.seeder';
import { UsersSeeder } from '../users.seeder';
import { AdminSeeder } from '../admin.seeder';

@Command({ 
  name: 'seed', 
  description: 'Seed database with initial data',
  arguments: '[action]',
  options: { isDefault: false }
})
export class SeedCommand extends CommandRunner {
  constructor(
    private readonly categoriesSeeder: CategoriesSeeder,
    private readonly usersSeeder: UsersSeeder,
    private readonly adminSeeder: AdminSeeder
  ) {
    super();
  }

  async run(inputs: string[], options?: Record<string, any>): Promise<void> {
    const action = inputs[0] || 'seed';
    
    switch (action) {
      case 'seed':
        console.log('Запуск сидинга всех данных...');
        await this.categoriesSeeder.seed();
        await this.usersSeeder.seed();
        await this.adminSeeder.seed();
        console.log('Сидинг завершен успешно!');
        break;
      case 'clear':
        console.log('Очистка всех данных...');
        await this.usersSeeder.clear();
        await this.categoriesSeeder.clear();
        console.log('Очистка завершена успешно!');
        break;
      default:
        console.log(`Неизвестное действие: ${action}`);
        console.log('Доступные действия: seed, clear');
    }
  }
}