import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'fans-crm',
      models: [__dirname + '/**/*.model.ts'],
      autoLoadModels: true,
      synchronize: true,
    }),
    AuthModule,
    UserModule,
  ],
  controllers: [AppController, AuthController, UserController],
  providers: [AppService, UserService],
})
export class AppModule {}
