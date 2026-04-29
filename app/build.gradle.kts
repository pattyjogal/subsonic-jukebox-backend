plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.kotlin.serialization)
    application
}

application {
    mainClass = "subsonic.search.AppKt"
}

repositories {
    mavenCentral()
}

dependencies {
    implementation(libs.ktor.server.core)
    implementation(libs.ktor.server.netty)
    implementation(libs.ktor.server.content.negotiation)
    implementation(libs.ktor.serialization.kotlinx.json)
    implementation(libs.ktor.server.sse)
    implementation(libs.ktor.client.core)
    implementation(libs.ktor.client.cio)
    implementation(libs.ktor.client.content.negotiation)
    implementation(libs.kotlinx.serialization.json)
    implementation(libs.logback.classic)

    testImplementation("org.jetbrains.kotlin:kotlin-test")
    testImplementation(libs.junit.jupiter.engine)
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(17)
    }
}

application {
    mainClass = "subsonic.search.AppKt"
}

tasks.named<Test>("test") {
    useJUnitPlatform()
}
val buildWeb = tasks.register<Exec>("buildWeb") {
    group = "build"
    description = "Builds the React frontend"
    workingDir = file("../web")

    onlyIf { System.getenv("SKIP_WEB_BUILD") != "true" }
...
    val isWindows = org.gradle.internal.os.OperatingSystem.current().isWindows
    if (isWindows) {
        commandLine("npm.cmd", "run", "build")
    } else {
        commandLine("npm", "run", "build")
    }

    inputs.dir("../web/src")
    inputs.file("../web/package.json")
    inputs.file("../web/vite.config.ts")
    outputs.dir("../web/dist")
}

tasks.processResources {
    dependsOn(buildWeb)
    from(buildWeb.map { it.outputs.files.asPath + "/dist" }) {
        into("static")
    }
}
