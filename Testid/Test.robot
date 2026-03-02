***Settings***
Suite Setup
Test Setup
Test Teardown
Suite Teardown

Library  SeleniumLibrary  timeout=5  implicit_wait=0.5  run_on_failure=Capture Page Screenshot
Library    XML

*** Variables ***
${BROWSER}       Chrome
${LOGIN_URL}     https://proovikivi.ee/login
${CREATE_ACCOUNT}  https://proovikivi.ee/create-account
${PROJECTS_URL}  https://proovikivi.ee/projects
${CREATE_PROJECT_URL}    https://proovikivi.ee/create-project
${IMAGE_PATH}  C:/MinuKasutaja/Kaust/kaanepilt.jpg

*** Test Cases ***
Test Case 1: Konto loomine korrektsete andmetega
    Open Browser    ${CREATE_ACCOUNT}    ${BROWSER}
    Maximize Browser Window
    Click Element    id=create-account-button
    Wait Until Element Is Visible    id=registration-form
    Input Text    id=full-name    John Doe
    Input Text    id=email    johndoe@example.com
    Select From List by Index    id=gender    1
    Select From List by Index    id=day    1
    Select From List by Index    id=month    1
    Select From List by Index    id=year    1
    Select From List by Index    id=user-type    1
    Input Text    id=related-institutions-search    Institution
    Click Element    xpath=//*[contains(text(),'Institution')]
    Input Password    id=password    TestPassword123
    Input Password    id=confirm-password    TestPassword123
    Click Button    id=create-account-submit
    Page Should Contain Element    xpath=//*[contains(text(),'Account created successfully')]
    [Teardown]    Close Browser

Test Case 2: Konto loomine, sisestades ebakorrektsed andmed
    Open Browser    ${CREATE_ACCOUNT}    ${BROWSER}


Test Case 3: Sisselogimine korrektsete andmetega
    Open Browser    ${LOGIN_URL}    ${BROWSER}
    Maximize Browser Window
    Input Text    id=email    validemail@example.com
    Input Password    id=password    TestPassword123
    Click Button    id=login-button
    Close Browser

Test Case 4: Sisselogimine ebakorrektsete andmetega
    
    # Epost mis ei ole eelenevalt registreeritud
    Open Browser    ${LOGIN_URL}    ${BROWSER}
    Maximize Browser Window
    Input Text    id=email    invalid@Emailexample.com
    Input Password    id=password    TestPassword123
    Click Button    id=login-button
    Wait Until Page Contains Element    xpath=//*[contains(text(),'Incorrect email or password')]
    Close Browser

    # Epost mis ei sisalda @
    Input Text    id=email    invalidEmailxample.com
    Input Password    id=password    TestPassword123
    Click Button    id=login-button
    Wait Until Page Contains Element    xpath=//*[contains(text(),'Incorrect email or password')]
    Close Browser

    # Katse ilma paroolita
    Input Text    id=email    validemail@example.com
    Click Button    id=login-button
    Wait Until Page Contains Element    xpath=//*[contains(text(),'Incorrect email or password')]
    Close Browser

    # Katse ilma epostita
    Input Password    id=password    TestPassword123
    Click Button    id=login-button
    Wait Until Page Contains Element    xpath=//*[contains(text(),'Incorrect email or password')]
    Close Browser

    # Vale parool / parool mis ei vasta emailile
    Input Text    id=email    validemail@example.com
    Input Password    id=password    invalidPassword123
    Click Button    id=login-button
    Wait Until Page Contains Element    xpath=//*[contains(text(),'Incorrect email or password')]
    Close Browser

Test Case 5: Sisse logitud vaade - Projektide otsimine ja sorteerimine
    Open Browser    ${PROJECTS_URL}    ${BROWSER}
    Maximize Browser Window

    # Otsing asukoha järgi
    Click Element    id=search-input
    Input Text    id=search-input    Tallinn
    Click Button    id=search-button
    Close Browser

    # Otsing märksõna järgi
    Click Element    id=search-input
    Input Text    id=search-input    robotframework
    Click Button    id=search-button
    Close Browser

    # Sorteerimine populaarsuse järgi
    Click Element    id=sort-select
    Click Element    xpath=//*[@value='popularity']
    Close Browser

    # Sorteerimine uuemate järgi
    Click Element    id=sort-select
    Click Element    xpath=//*[@value='newest']
    Close Browser

    # Sorteerimine vanemate järgi
    Click Element    id=sort-select
    Click Element    xpath=//*[@value='oldest']
    Close Browser

    # Sorteerimine aktiivsete järgi
    Click Element    id=sort-select
    Click Element    xpath=//*[@value='active']
    Close Browser

    # Sorteerimine mitteaktiivsete järgi
    Click Element    id=sort-select
    Click Element    xpath=//*[@value='inactive']
    Close Browser

    # Vaade Minu projektidele
    Click Button    id=my-projects-button
    Close Browser

    # Vaade Lemmikutele
    Click Button    id=favorites-button
    Close Browser

    # Vaade Kõikidele projektidele
    Click Button    id=all-projects-button
    Close Browser

Test Case 6: Sisse logitud vaade - Projekti loomine
    Open Browser    ${CREATE_PROJECT_URL}    ${BROWSER}
    Maximize Browser Window

    # Vali väljad projekti loomiseks
    Click Button    id=create-project-button
    Wait Until Page Contains    Projekti loomine

    # Täida kohustuslikud väljad
    Input Text    id=title-input    Minu projekt
    Select From List by Index    id=proovikivi-select    1
    Click Element    id=supervisor-input
    Input Text    id=supervisor-input    Juhendaja
    Wait Until Page Contains    Juhendaja Nimi
    Click Element    xpath=//*[contains(text(), 'Juhendaja Nimi')]
    Click Button    id=next-button
    Wait Until Page Contains    Nüüd saad hakkata projektile sisu looma

    # Valikulised väljad
    Click Button    id=add-cover-image
    Choose File    id=file-input    ${IMAGE_PATH}
    Click Button    id=open-button
    Input Text    id=cover-description-input    Kaanepildi kirjeldus
    Select From List by Index    id=location-select    1
    Input Text    id=location-precision-input    Asukoha täpsustus
    Select From List By Label    id=start-date-day-select    1
    Select From List By Label    id=start-date-month-select    January
    Select From List By Label    id=start-date-year-select    2024
    Select From List By Label    id=end-date-day-select    31
    Select From List By Label    id=end-date-month-select    December
    Select From List By Label    id=end-date-year-select    2024
    Input Text    id=team-member-input    Meeskonna liige
    Wait Until Page Contains Element    xpath=//*[contains(text(), 'Meeskonna liige')]
    Click Element    xpath=//*[contains(text(), 'Meeskonna liige')]
    Select From List by Index    id=related-goals-select    1
    Select From List by Index    id=related-subjects-select    1
    Input Text    id=other-tags-input    Muud sildid
    Input Text    id=problem-understanding-input    Probleemi mõistmine
    Input Text    id=solution-idea-input    Lahendusidee
    Input Text    id=project-plan-input    Projekti plaan ja elluviimine
    Input Text    id=results-conclusions-input    Tulemused ja järeldused
    Input Text    id=add-link-input    drive.google.com
    Input Text    id=add-youtube-link-input    YouTube.com
    Click Button    id=publish-button
    Wait Until Page Contains    Projekt on edukalt avaldatud!
    Click Button    id=next-button
    Close Browser