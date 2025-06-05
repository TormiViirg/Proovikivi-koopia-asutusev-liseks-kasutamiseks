-- ============================================
-- Created by Vertabelo (http://vertabelo.com)
-- Last modification date: 2024-06-18 07:19:17.557
-- ============================================

-- (1) “Lookup” tables / “base” tables with no incoming FKs first:

-- Table: gender
CREATE TABLE gender (
    id INT       NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Table: user_type
CREATE TABLE user_type (
    id INT             NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255)  NOT NULL
);

-- Table: institution
CREATE TABLE institution (
    id INT             NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255)  NOT NULL
);

-- Table: location
CREATE TABLE location (
    id INT             NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255)  NOT NULL
);

-- Table: school_subject
CREATE TABLE school_subject (
    id INT             NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255)  NOT NULL
);

-- Table: global_goal
CREATE TABLE global_goal (
    id INT             NOT NULL AUTO_INCREMENT PRIMARY KEY,
    image BLOB         NOT NULL,
    title VARCHAR(255) NOT NULL
);

-- Table: proovikivi
CREATE TABLE proovikivi (
    id   INT            NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255)  NOT NULL,
    image BLOB          NOT NULL,
    goal VARCHAR(250)   NULL
);

-- ============================================
-- (2) “User” table (it references gender, user_type, institution)
CREATE TABLE `user` (
    id               INT             NOT NULL AUTO_INCREMENT PRIMARY KEY,
    username         VARCHAR(50)     NOT NULL,
    email            VARCHAR(255)    NOT NULL,
    gender_id        INT             NOT NULL,
    birthdate        DATE            NOT NULL,
    user_type_id     INT             NOT NULL,
    institution_id   INT             NULL,
    password         VARCHAR(255)    NOT NULL,
    profile_picture  BLOB            NULL,
    login_count      INT             NOT NULL,
    reset_token      VARCHAR(6)      NULL,
    token_expire     DATETIME        NULL,
    CONSTRAINT uq_user_email UNIQUE (email)
);

-- ============================================
-- (3) “Project” table (it references user, proovikivi, location, institution)
CREATE TABLE project (
    id                   INT            NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id              INT            NOT NULL,
    title                VARCHAR(255)   NOT NULL,
    proovikivi_id        INT            NOT NULL,
    supervisor           VARCHAR(255)   NOT NULL,
    image                MEDIUMBLOB     NULL,
    image_description    VARCHAR(255)   NULL,
    start_date           DATE           NULL,
    end_date             DATE           NULL,
    location_id          INT            NULL,
    location_specify     VARCHAR(255)   NULL,
    team_member          VARCHAR(255)   NULL,
    institution_id       INT            NULL,
    tag                  VARCHAR(255)   NULL,
    problem_description  VARCHAR(500)   NULL,
    solution_idea        VARCHAR(500)   NULL,
    project_plan         VARCHAR(500)   NULL,
    results_conclusion   VARCHAR(500)   NULL,
    web_link             VARCHAR(255)   NULL,
    youtube_link         VARCHAR(255)   NULL,
    published            BOOL           NOT NULL,
    flagged_count        INT            NULL,
    favourite_count      INT            NULL,
    created_date         TIMESTAMP      NOT NULL
);

-- ============================================
-- (4) “Join” / Many‐to‐Many / Dependent tables

-- Table: favourite_project (references project, user)
CREATE TABLE favourite_project (
    id         INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id    INT NOT NULL,
    project_id INT NOT NULL
);

-- Table: project_global_goal (references project, global_goal)
CREATE TABLE project_global_goal (
    project_id     INT NOT NULL,
    global_goal_id INT NOT NULL,
    PRIMARY KEY (project_id, global_goal_id)
);

-- Table: project_school_subject (references project, school_subject)
CREATE TABLE project_school_subject (
    project_id        INT NOT NULL,
    school_subject_id INT NOT NULL,
    PRIMARY KEY (project_id, school_subject_id)
);

-- Table: project_team_member (references user, project)
CREATE TABLE project_team_member (
    id         INT NOT NULL,
    user_id    INT NOT NULL,
    project_id INT NOT NULL,
    CONSTRAINT project_team_member_pk PRIMARY KEY (id)
);

-- Table: supervisor (references user, project)
CREATE TABLE supervisor (
    id         INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id    INT NOT NULL,
    project_id INT NOT NULL
);

-- ============================================
-- (5) Add all FOREIGN KEY constraints now that every referenced table exists

-- favourite_project → project(id), → user(id)
ALTER TABLE favourite_project
  ADD CONSTRAINT favourite_project_project
    FOREIGN KEY (project_id) REFERENCES project (id),
  ADD CONSTRAINT favourite_project_user
    FOREIGN KEY (user_id)    REFERENCES `user`  (id);

-- project_global_goal → project(id), → global_goal(id)
ALTER TABLE project_global_goal
  ADD CONSTRAINT project_global_goal_project
    FOREIGN KEY (project_id)     REFERENCES project     (id),
  ADD CONSTRAINT project_global_goal_global_goal
    FOREIGN KEY (global_goal_id) REFERENCES global_goal (id);

-- project_school_subject → project(id), → school_subject(id)
ALTER TABLE project_school_subject
  ADD CONSTRAINT project_school_subject_project
    FOREIGN KEY (project_id)        REFERENCES project        (id),
  ADD CONSTRAINT project_school_subject_school_subject
    FOREIGN KEY (school_subject_id) REFERENCES school_subject (id);

-- project_team_member → project(id), → user(id)
ALTER TABLE project_team_member
  ADD CONSTRAINT project_team_member_project
    FOREIGN KEY (project_id) REFERENCES project (id),
  ADD CONSTRAINT project_team_member_user
    FOREIGN KEY (user_id)    REFERENCES `user` (id);

-- supervisor → project(id), → user(id)
ALTER TABLE supervisor
  ADD CONSTRAINT supervisor_project
    FOREIGN KEY (project_id) REFERENCES project (id),
  ADD CONSTRAINT supervisor_user
    FOREIGN KEY (user_id)    REFERENCES `user`    (id);

-- project → user(id), → proovikivi(id), → location(id), → institution(id)
ALTER TABLE project
  ADD CONSTRAINT project_user
    FOREIGN KEY (user_id)       REFERENCES `user`   (id),
  ADD CONSTRAINT project_proovikivi
    FOREIGN KEY (proovikivi_id) REFERENCES proovikivi (id),
  ADD CONSTRAINT project_location
    FOREIGN KEY (location_id)   REFERENCES location  (id),
  ADD CONSTRAINT project_institution
    FOREIGN KEY (institution_id) REFERENCES institution (id);

-- user → gender(id), → user_type(id), → institution(id)
ALTER TABLE `user`
  ADD CONSTRAINT user_gender
    FOREIGN KEY (gender_id)      REFERENCES gender      (id),
  ADD CONSTRAINT user_user_type
    FOREIGN KEY (user_type_id)   REFERENCES user_type   (id),
  ADD CONSTRAINT user_institution
    FOREIGN KEY (institution_id) REFERENCES institution (id);

ALTER TABLE `user`
  MODIFY COLUMN login_count INT NOT NULL DEFAULT 0;

-- No other FKs remain. End of schema.
