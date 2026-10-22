# Tap Tile Game (Java Full Stack Mini Project)

Piano-Tiles style game. Game loop = JavaScript (browser), backend = Spring Boot (scores save + leaderboard).

**Stack:** Spring Boot 2.7 (Spring MVC), Thymeleaf, Hibernate/JPA, H2 database, Maven, Java 11+

## Run
```
mvn spring-boot:run
```
Open http://localhost:8080

(IntelliJ / Eclipse / STS: Import as Maven project -> run `TapTileApplication`)

## Pages
| URL | Page |
|---|---|
| `/` | Enter name + select difficulty |
| `/play` | Game screen |
| `/leaderboard` | Top 10 scores |
| `/h2-console` | DB console (JDBC URL: `jdbc:h2:file:./data/taptiledb`, user `sa`, blank password) |

## How to play
Tap black tiles (mouse / touch, or keys D F J K). Missing a black tile or tapping a white one = Game Over.
