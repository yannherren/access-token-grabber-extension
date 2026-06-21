export const transformToken = (token: string, removeBearer: boolean) => {
    return removeBearer ?
        token.replace("Bearer ", "").replace("bearer ", "")
        : token;
}