@REM ----------------------------------------------------------------------------
@REM Maven Start Up Batch script
@REM ----------------------------------------------------------------------------

@IF "%DEBUG%" == "true" @ECHO ON
@SETLOCAL

@REM Get the directory of this script
@SET "DIRNAME=%~dp0"
@IF "%DIRNAME%" == "" @SET "DIRNAME=."

@SET "WRAPPER_JAR=%DIRNAME%\.mvn\wrapper\maven-wrapper.jar"
@SET "WRAPPER_PROPERTIES=%DIRNAME%\.mvn\wrapper\maven-wrapper.properties"

@REM Download the wrapper jar if it doesn't exist
@IF NOT EXIST "%WRAPPER_JAR%" (
    @ECHO "Downloading Maven Wrapper JAR..."
    @powershell -Command "& { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object Net.WebClient).DownloadFile('https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar', '%WRAPPER_JAR%') }"
)

@REM Find java.exe
@IF DEFINED JAVA_HOME (
    @SET "JAVA_EXE=%JAVA_HOME%\bin\java.exe"
) ELSE (
    @SET "JAVA_EXE=java.exe"
)

@REM Execute Maven
"%JAVA_EXE%" -classpath "%WRAPPER_JAR%" "-Dmaven.multiModuleProjectDirectory=%DIRNAME%." org.apache.maven.wrapper.MavenWrapperMain %*

@ENDLOCAL
