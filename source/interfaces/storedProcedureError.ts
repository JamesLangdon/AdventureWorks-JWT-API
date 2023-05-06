export interface IStoredProcedureError{
    ErrorNumber: number;
    ErrorState: number;
    ErrorSeverity: number;
    ErrorLine: number;
    ErrorProcedure: string;    
    ErrorMessage: string;
    ErrorDateTime: Date;
}