FROM microsoft/dotnet:2.1.4-aspnetcore-runtime AS base
WORKDIR /app
EXPOSE 80

FROM microsoft/dotnet:2.1.402-sdk AS build
WORKDIR /src
COPY CoPassword.Services.App/CoPassword.Services.App.csproj CoPassword.Services.App/
COPY C:\Users\mmueller\Repos\CoPassword\CoPassword.Services.App\CoPassword.Services.App\nuget.config CoPassword.Services.App/
RUN dotnet restore CoPassword.Services.App/CoPassword.Services.App.csproj
COPY . .
WORKDIR /src/CoPassword.Services.App
RUN dotnet build CoPassword.Services.App.csproj -c Release -o /app

FROM build AS publish
RUN dotnet publish CoPassword.Services.App.csproj -c Release -o /app

FROM base AS final
WORKDIR /app
COPY --from=publish /app .
ENTRYPOINT ["dotnet", "CoPassword.Services.App.dll"]
