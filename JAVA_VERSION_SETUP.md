# Java Version Setup

## Issue
The project requires **Java 17**, but your system is using Java 23. Lombok doesn't fully support Java 23 yet.

## Solution: Switch to Java 17

### Option 1: Using SDKMAN (Recommended for macOS/Linux)

```bash
# Install SDKMAN if you don't have it
curl -s "https://get.sdkman.io" | bash
source "$HOME/.sdkman/bin/sdkman-init.sh"

# Install Java 17
sdk install java 17.0.11-tem

# Use Java 17 for this project
sdk use java 17.0.11-tem

# Verify
java -version  # Should show version 17
```

### Option 2: Using Homebrew (macOS)

```bash
# Install Java 17
brew install openjdk@17

# Link it
sudo ln -sfn /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk

# Set JAVA_HOME for current session
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk
export PATH="$JAVA_HOME/bin:$PATH"

# Verify
java -version  # Should show version 17
```

### Option 3: Set JAVA_HOME in your shell profile

Add to `~/.zshrc` or `~/.bash_profile`:

```bash
export JAVA_HOME=/path/to/java17
export PATH="$JAVA_HOME/bin:$PATH"
```

### Option 4: Use Maven Toolchains (Advanced)

Create `~/.m2/toolchains.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<toolchains>
  <toolchain>
    <type>jdk</type>
    <provides>
      <version>17</version>
    </provides>
    <configuration>
      <jdkHome>/path/to/java17</jdkHome>
    </configuration>
  </toolchain>
</toolchains>
```

## Verify Setup

After switching to Java 17:

```bash
java -version
# Should show: openjdk version "17.x.x"

cd backend/auth-service
mvn clean compile
# Should compile successfully
```

## Quick Fix for Current Session

If you just want to test quickly:

```bash
# Find Java 17 installation
/usr/libexec/java_home -V

# Use Java 17 for this session
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export PATH="$JAVA_HOME/bin:$PATH"

# Verify
java -version
```

