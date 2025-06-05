const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();

app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'ejs');

// Middleware
app.use('/css', express.static(path.join(__dirname, 'node_modules/@fortawesome/fontawesome-free/css')));
app.use('/webfonts', express.static(path.join(__dirname, 'node_modules/@fortawesome/fontawesome-free/webfonts')));
app.use(session({ secret: 'minuAbsoluutseltSalajaneVõti', saveUninitialized: true, resave: true }));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

//app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
//app.use(bodyParser.json({ limit: '10mb' }));

const loginRouter = require('./routes/login');
const signupRouter = require('./routes/signup');
const passwordResetRouter = require('./routes/password-reset');
const userProfileRouter = require('./routes/profile');
const projectsRouter = require('./routes/projects')
const projectFullViewRouter = require('./routes/project-fullview');
const projectFormRouter = require('./routes/project-form');
const logoutRouter = require('./routes/logout');
const projectUpdateRouter = require('./routes/project-update');

const adminProjectsRouter = require('./routes/admin-projects')
const adminProjectFullViewRouter = require('./routes/admin-project-fullview');
const adminPanelRouter = require('./routes/admin-panel')

app.use('/login', loginRouter);
app.use('/signup', signupRouter);
app.use('/passwordReset', passwordResetRouter);
app.use('/project-form', projectFormRouter);
app.use('/projects', projectsRouter);
app.use('/project', projectFullViewRouter);
app.use('/profile', userProfileRouter);
app.use(logoutRouter);
app.use('/project-update', projectUpdateRouter);

app.use('/admin/projects', adminProjectsRouter);
app.use('/admin/project', adminProjectFullViewRouter);
app.use('/admin/panel', adminPanelRouter);

app.get('/', (req, res) => {
    res.redirect('/login');
});


app.listen(3000, () => {
    console.log('Server is running on port 3000');
});