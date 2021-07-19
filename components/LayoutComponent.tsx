
// [Permanent drawer](https://material-ui.com/components/drawers/#permanent-drawer)
import React from 'react';
import { useRouter } from 'next/router';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Link from '@material-ui/core/Link';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';
import NavigateNext from '@material-ui/icons/NavigateNext';

import RibbonComponent from './RibbonComponent';


const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    appBar: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
    },
    drawerPaper: {
      width: drawerWidth,
    },
    // necessary for content to be below app bar
    toolbar: theme.mixins.toolbar,
    content: {
      flexGrow: 1,
      backgroundColor: theme.palette.background.default,
      padding: theme.spacing(3),
    },
  }),
);

/** コンポーネント用プロパティ */
interface Props{
  /** ページタイトル */
  title:string;
  /** ページ内容 */
  content:React.ReactElement;
  /** 現在のページ */
  page:string;
}

interface MenuItem{
  text:string;
  link:string;
}
const menuItems:MenuItem[] = [
  {text: "top", link: "/"},
  // {text: "chapter1", link: ""},
  // {text: "page1", link: "/page1"},
  // {text: "page2", link: "/page2"},
  {text: "php", link: "/php"},
  {text: "plantuml", link: "/plantuml"},
  {text: "mermaid", link: "/mermaid"},
];

// export default function Menu() {
/**
 * レイアウトコンポーネント
 */
const LayoutComponent: React.FC<Props> = (props)=>{
  const classes = useStyles();
  const router = useRouter();

  return (
    <div className={classes.root}>
      <CssBaseline />
      {/* <RibbonComponent /> */}
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <Typography variant="h6" noWrap>
            {/* Permanent drawer */}
            {props.title}
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        className={classes.drawer}
        variant="permanent"
        classes={{
          paper: classes.drawerPaper,
        }}
        anchor="left"
      >
        <div className={classes.toolbar} />
        <Divider />
        <List>
          {menuItems.map((item)=>{
            if(item.link==""){
              return(
                <ListItem key={item.link} selected={props.page === item.text}>
                  <ListItemText primary={item.text} />
                </ListItem>
              )
            }else{
              return (
                <ListItem key={item.link} selected={props.page === item.text} button component="a" href={router.basePath + item.link}>
                  <ListItemText primary={item.text} />
                  <ListItemIcon><NavigateNext/></ListItemIcon>
                </ListItem>
              )
            }
          })}
        </List>
      </Drawer>

      <main className={classes.content}>
        <div className={classes.toolbar} />
        {props.content}
      </main>
    </div>
  );
}
export default LayoutComponent;