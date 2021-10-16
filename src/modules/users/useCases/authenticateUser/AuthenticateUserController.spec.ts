import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Create User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
  });
  it("Should be able to authenticate a user", async () => {
    const user: ICreateUserDTO = {
      name: "username",
      email: "email@test.com",
      password: "12345",
    };

    await createUserUseCase.execute(user);

    const result = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    expect(result).toHaveProperty("token");
    expect(result).toHaveProperty("user");
    expect(result).toHaveProperty("user.id");
    expect(result).toHaveProperty("user.email");
    expect(result).toHaveProperty("user.name");
    expect(result.token).not.toBeNull();
    expect(result.user.email).toEqual(user.email);
    expect(result.user.name).toEqual(user.name);
  });

  it("Should not be able to authenticate a user with wrong password", async () => {
    await expect(async () => {
      const validUser: ICreateUserDTO = {
        name: "validUser",
        email: "valid@email.com",
        password: "validpassword",
      };

      await createUserUseCase.execute(validUser);

      await authenticateUserUseCase.execute({
        email: validUser.email,
        password: "invalidpassword",
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("Should not be able to authenticate a non-existing user", async () => {
    await expect(async () => {
      const SniffingUser: ICreateUserDTO = {
        name: "nouser",
        email: "nouser@nouser.com",
        password: "nouser",
      };

      await authenticateUserUseCase.execute({
        email: SniffingUser.email,
        password: SniffingUser.password,
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});