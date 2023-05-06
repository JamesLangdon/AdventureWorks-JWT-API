export interface IUser {
    UserId: number;
    UserName: string;
    FirstName: string;
    MiddleName?: string;
    LastName: string;
    Password: string;
    Active: boolean;
    CreateDate: Date;
    CreatedBy: string;
    ModifiedDate: Date;
    ModifiedBy: string;
    Role: string;
}

export interface IUserRecordCount{
    RecordCount: number;
}
