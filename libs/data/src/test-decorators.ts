import { IsString, IsNumber } from './lib/decorators';

class TestClass {
  @IsString()
  name!: string;

  @IsNumber()
  age!: number;
}

export { TestClass };