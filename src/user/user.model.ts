import { Exclude } from 'class-transformer';
import { Table, Column, Model, Unique } from 'sequelize-typescript';

@Table({
  tableName: 'users',
})
export class User extends Model {
  @Column
  firstname: string;

  @Column
  lastname: string;

  @Unique
  @Column
  email: string;

  @Column
  @Exclude()
  password: string;
}
