# EF Core DbContext Initialization

1. Make sure working tree is clean.

   ```shell
   git status
   ```

   If the working tree is not clean, please stop execution.

2. Use EF Core Power Tools CLI to generate required.

   ```shell
   efcpt "Server=(localdb)\MSSQLLocalDB;Initial Catalog=ContosoUniversity;Trusted_Connection=True;Encrypt=false" mssql
   ```

3. Run build to make sure everything is all right.

   ```shell
   dotnet build
   ```

4. Configure `Program.cs` for DI and configure `appsettings.json` for connection
   strings. Reference from `efcpt-readme.md` file for instructions. Make sure using
   necessary namespaces.

5. Run build to make sure everything is all right.

   ```shell
   dotnet build
   ```

Let's do this step by step.
