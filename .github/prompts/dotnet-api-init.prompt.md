# .NET API Initialization

1. Make sure `git` cli is installed and configured on your machine.

   ```shell
   git --version
   ```

   If you don't have git installed, please stop execution.

2. Make sure working tree is clean.

   ```shell
   git status
   ```

   If the working tree is not clean, please stop execution.

3. Check .NET SDK version. It must be larger than `10.0.100`.

   ```shell
   dotnet --version
   ```

   If you don't have .NET SDK installed, please stop execution.

4. Use `dotnet` cli to create project by using `webapi` template, and replace `{project-name}` with the name of the project you want to create.(ask user for project name)

   ```shell
   dotnet new webapi -n {project-name}
   ```

5. Add Entity Framework Core `10` and related SQL Server NuGet packages. Don't use prerelease version.

   Ask user whether they want to use Entity Framework Core. If not, just skip steps 5 and 6.

6. Check for EF Core Power Tools cli has been installed.

   ```shell
   efcpt --version
   ```

   If you don't have EF Core Power Tools cli installed, please run the following command to install it.

   ```shell
   dotnet tool update ErikEJ.EFCorePowerTools.Cli -g --version `10.*`
   ```

7. Setup C# Global Usings in the project.

   The file name must be `GlobalUsings.cs`. Add some common namespace to it.

8. Add `.gitignore` file.

   ```shell
   dotnet new gitignore
   ```

9. Add `.gitattributes` file that avoid cross-platform issues.

   Here is the default template for `.gitattributes`. Add the content to the `.gitattributes` file.

   ```txt
   # Set default behavior to automatically normalize line endings.
   * text=auto

   # Force batch scripts to always use CRLF line endings so that if a repo is accessed
   # in Windows via a file share from Linux, the scripts will work.
   *.{cmd,[cC][mM][dD]} text eol=crlf
   *.{bat,[bB][aA][tT]} text eol=crlf

   # Force bash scripts to always use LF line endings so that if a repo is accessed
   # in Unix via a file share from Windows, the scripts will work.
   *.sh text eol=lf

   .env text eol=lf
   Dockerfile text eol=lf

   # Denote all files that are truly binary and should not be modified.
   *.mp3 binary
   *.wav binary
   *.bmp binary
   *.png binary
   *.jpg binary
   *.gif binary
   ```

10. Add `.editorconfig` file.

    ```shell
    dotnet new editorconfig
    ```

11. Modify `.editorconfig` to enforce coding style.

    Please merge under `.editorconfig` settings to the `.editorconfig` file:

    ```txt
    [*]
    insert_final_newline = true

    # Set default charset for utf-8
    [*.{cs,csx,vb,vbx,txt,html,htm,css,js,json,yml,yaml,xml,config,ini,sh,ps1,psm1,psd1,ps1xml,psrc1xml,csproj,sln,gitignore,gitattributes,editorconfig,md,markdown,asciidoc,adoc,asc,ascidoc,ipynb,py}]
    charset = utf-8
    ```

Let's do this step by step.
