import { Factory, Seeder } from 'typeorm-seeding';
import { DataSource } from 'typeorm';
import { Users } from '../../entities/Users';
import { Places } from '../../entities/Places';

export default class CreateUsers implements Seeder {
  public async run(factory: Factory, datasource: DataSource): Promise<any> {
    await datasource
      .createQueryBuilder()
      .insert()
      .into(Users)
      .values([{ userId: '3ede0ef2-92b7-4817-a5f3-0c575361f745' }])
      .execute();

    await datasource
      .createQueryBuilder()
      .insert()
      .into(Places)
      .values([
        { placeId: '2e4baf1c-5acb-4efb-a1af-eddada31b00f', name: 'suwon' },
      ])
      .execute();
  }
}
