ThisBuild / version := "0.1.0-SNAPSHOT"

ThisBuild / scalaVersion := "2.13.12"

lazy val root = (project in file("."))
  .settings(
    name := "data-processing-api",
    libraryDependencies ++= Seq(
      "com.typesafe.akka" %% "akka-http" % "10.5.3",
      "com.typesafe.akka" %% "akka-stream" % "2.8.5",
      "com.typesafe.akka" %% "akka-actor-typed" % "2.8.5",
      "com.typesafe.akka" %% "akka-http-spray-json" % "10.5.3",
      "com.github.tototoshi" %% "scala-csv" % "1.3.10",
      "org.json4s" %% "json4s-native" % "4.0.7",
      "org.json4s" %% "json4s-jackson" % "4.0.7",
      "org.scala-lang.modules" %% "scala-xml" % "2.2.0",
      "ch.qos.logback" % "logback-classic" % "1.4.14",
      "org.scalatest" %% "scalatest" % "3.2.17" % Test
    )
  )

