import { UserModel } from "@/types/user";

export const GetAllUsers = async () => {
    const result = await fetch("http://localhost:8000/auth/all")

    const users: UserModel[] = await result.json();

    return users;
}

export const GetUserById = async (id: string) => {
    const result = await fetch(`http://localhost:8000/auth/${id}`);

    const user: UserModel = await result.json();
    return user;
}