// import { Injectable, ExecutionContext } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';

// @Injectable()
// export class JwtAuthGuard extends AuthGuard('jwt') {
//   canActivate(context: ExecutionContext) {
//     // Add your custom logic to extract the authKey from the header
//     const request = context.switchToHttp().getRequest();
//     const accessToken = request.headers['authKey'];

//     // Set the authKey in the request for passport-jwt to use
//     if (accessToken) {
//       request.headers.authorization = `${accessToken}`;
//     }

//     return super.canActivate(context);
//   }
// }
