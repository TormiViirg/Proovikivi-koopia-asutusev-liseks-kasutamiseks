-- Created by Vertabelo (http://vertabelo.com)
-- Last modification date: 2024-06-18 07:19:17.557

-- tables
-- Table: favourite_project
CREATE TABLE favourite_project (
    id int  NOT NULL AUTO_INCREMENT,
    user_id int  NOT NULL,
    project_id int  NOT NULL,
    CONSTRAINT favourite_project_pk PRIMARY KEY (id)
);

-- Table: gender
CREATE TABLE gender (
    id int  NOT NULL,
    name varchar(255)  NOT NULL,
    CONSTRAINT gender_pk PRIMARY KEY (id)
);

-- Table: global_goal
CREATE TABLE global_goal (
    id int  NOT NULL AUTO_INCREMENT,
    image blob  NOT NULL,
    title varchar(255)  NOT NULL,
    CONSTRAINT global_goal_pk PRIMARY KEY (id)
);

-- Table: institution
CREATE TABLE institution (
    id int  NOT NULL AUTO_INCREMENT,
    name varchar(255)  NOT NULL,
    CONSTRAINT institution_pk PRIMARY KEY (id)
);

-- Table: location
CREATE TABLE location (
    id int  NOT NULL AUTO_INCREMENT,
    name varchar(255)  NOT NULL,
    CONSTRAINT location_pk PRIMARY KEY (id)
);

-- Table: project
CREATE TABLE project (
    id int  NOT NULL AUTO_INCREMENT,
    user_id int  NOT NULL,
    title varchar(255)  NOT NULL,
    proovikivi_id int  NOT NULL,
    supervisor varchar(255)  NOT NULL,
    image mediumblob  NULL,
    image_description varchar(255)  NULL,
    start_date date  NULL,
    end_date date  NULL,
    location_id int  NULL,
    location_specify varchar(255)  NULL,
    team_member varchar(255)  NULL,
    institution_id int  NULL,
    tag varchar(255)  NULL,
    problem_description varchar(500)  NULL,
    solution_idea varchar(500)  NULL,
    project_plan varchar(500)  NULL,
    results_conclusion varchar(500)  NULL,
    web_link varchar(255)  NULL,
    youtube_link varchar(255)  NULL,
    published bool  NOT NULL,
    flagged bool  NOT NULL,
    favourite_count int  NULL,
    created_date timestamp  NOT NULL,
    CONSTRAINT project_pk PRIMARY KEY (id)
);

-- Table: project_global_goal
CREATE TABLE project_global_goal (
    project_id INT NOT NULL,
    global_goal_id INT NOT NULL,
    PRIMARY KEY (project_id, global_goal_id),
    FOREIGN KEY (project_id) REFERENCES project(id),
    FOREIGN KEY (global_goal_id) REFERENCES global_goal(id)
);

-- Table: project_school_subject
CREATE TABLE project_school_subject (
    project_id INT NOT NULL,
    school_subject_id INT NOT NULL,
    PRIMARY KEY (project_id, school_subject_id),
    FOREIGN KEY (project_id) REFERENCES project(id),
    FOREIGN KEY (school_subject_id) REFERENCES school_subject(id)
);

-- Table: project_team_member
CREATE TABLE project_team_member (
    id int  NOT NULL,
    user_id int  NOT NULL,
    project_id int  NOT NULL,
    CONSTRAINT project_team_member_pk PRIMARY KEY (id)
);

-- Table: proovikivi
CREATE TABLE proovikivi (
    id int  NOT NULL AUTO_INCREMENT,
    title varchar(255)  NOT NULL,
    image blob  NOT NULL,
    goal varchar(250)  NULL,
    CONSTRAINT proovikivi_pk PRIMARY KEY (id)
);

-- Table: school_subject
CREATE TABLE school_subject (
    id int  NOT NULL AUTO_INCREMENT,
    name varchar(255)  NOT NULL,
    CONSTRAINT school_subject_pk PRIMARY KEY (id)
);

-- Table: supervisor
CREATE TABLE supervisor (
    id int  NOT NULL AUTO_INCREMENT,
    user_id int  NOT NULL,
    project_id int  NOT NULL,
    CONSTRAINT supervisor_pk PRIMARY KEY (id)
);

-- Table: user
CREATE TABLE user (
    id int  NOT NULL AUTO_INCREMENT,
    username varchar(50)  NOT NULL,
    email varchar(255)  NOT NULL,
    gender_id int  NOT NULL,
    birthdate date  NOT NULL,
    user_type_id int  NOT NULL,
    institution_id int  NULL,
    password varchar(255)  NOT NULL,
    profile_picture blob  NULL,
    login_count int  NOT NULL,
    reset_token varchar(6)  NULL,
    token_expire datetime  NULL,
    CONSTRAINT ID PRIMARY KEY (id)
);

-- Table: user_type
CREATE TABLE user_type (
    id int  NOT NULL AUTO_INCREMENT,
    name varchar(255)  NOT NULL,
    CONSTRAINT user_type_pk PRIMARY KEY (id)
);

-- foreign keys
-- Reference: favourite_project_project (table: favourite_project)
ALTER TABLE favourite_project ADD CONSTRAINT favourite_project_project FOREIGN KEY favourite_project_project (project_id)
    REFERENCES project (id);

-- Reference: favourite_project_user (table: favourite_project)
ALTER TABLE favourite_project ADD CONSTRAINT favourite_project_user FOREIGN KEY favourite_project_user (user_id)
    REFERENCES user (id);

-- Reference: project_global_goal_global_goal (table: project_global_goal)
ALTER TABLE project_global_goal ADD CONSTRAINT project_global_goal_global_goal FOREIGN KEY project_global_goal_global_goal (global_goal_id)
    REFERENCES global_goal (id);

-- Reference: project_global_goal_project (table: project_global_goal)
ALTER TABLE project_global_goal ADD CONSTRAINT project_global_goal_project FOREIGN KEY project_global_goal_project (project_id)
    REFERENCES project (id);

-- Reference: project_institution (table: project)
ALTER TABLE project ADD CONSTRAINT project_institution FOREIGN KEY project_institution (institution_id)
    REFERENCES institution (id);

-- Reference: project_location (table: project)
ALTER TABLE project ADD CONSTRAINT project_location FOREIGN KEY project_location (location_id)
    REFERENCES location (id);

-- Reference: project_proovikivi (table: project)
ALTER TABLE project ADD CONSTRAINT project_proovikivi FOREIGN KEY project_proovikivi (proovikivi_id)
    REFERENCES proovikivi (id);

-- Reference: project_school_subject_project (table: project_school_subject)
ALTER TABLE project_school_subject ADD CONSTRAINT project_school_subject_project FOREIGN KEY project_school_subject_project (project_id)
    REFERENCES project (id);

-- Reference: project_school_subject_school_subject (table: project_school_subject)
ALTER TABLE project_school_subject ADD CONSTRAINT project_school_subject_school_subject FOREIGN KEY project_school_subject_school_subject (school_subject_id)
    REFERENCES school_subject (id);

-- Reference: project_team_member_project (table: project_team_member)
ALTER TABLE project_team_member ADD CONSTRAINT project_team_member_project FOREIGN KEY project_team_member_project (project_id)
    REFERENCES project (id);

-- Reference: project_team_member_user (table: project_team_member)
ALTER TABLE project_team_member ADD CONSTRAINT project_team_member_user FOREIGN KEY project_team_member_user (user_id)
    REFERENCES user (id);

-- Reference: project_user (table: project)
ALTER TABLE project ADD CONSTRAINT project_user FOREIGN KEY project_user (user_id)
    REFERENCES user (id);

-- Reference: supervisor_project (table: supervisor)
ALTER TABLE supervisor ADD CONSTRAINT supervisor_project FOREIGN KEY supervisor_project (project_id)
    REFERENCES project (id);

-- Reference: supervisor_user (table: supervisor)
ALTER TABLE supervisor ADD CONSTRAINT supervisor_user FOREIGN KEY supervisor_user (user_id)
    REFERENCES user (id);

-- Reference: user_gender (table: user)
ALTER TABLE user ADD CONSTRAINT user_gender FOREIGN KEY user_gender (gender_id)
    REFERENCES gender (id);

-- Reference: user_institution (table: user)
ALTER TABLE user ADD CONSTRAINT user_institution FOREIGN KEY user_institution (institution_id)
    REFERENCES institution (id);

-- Reference: user_user_type (table: user)
ALTER TABLE user ADD CONSTRAINT user_user_type FOREIGN KEY user_user_type (user_type_id)
    REFERENCES user_type (id);

-- End of file.

