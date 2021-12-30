import { HttpResponse } from "@/presentation/protocols";
import { ServerError } from "@/presentation/errors";

export const httpResponse = {
    badRequest: (errors: Error[]): HttpResponse => ({
        statusCode: 400,
        body: errors,
    }),

    serverError: (error: Error): HttpResponse => {
        console.log("Internal Server Error: ", error);
        return {
            statusCode: 500,
            body: [new ServerError(error.stack as string)],
        };
    },

    ok: (data: any): HttpResponse => ({
        statusCode: 200,
        body: data,
    }),

    noContent: (): HttpResponse => ({
        statusCode: 204,
        body: null,
    }),

    created: (data: any): HttpResponse => ({
        statusCode: 201,
        body: data,
    }),
};
