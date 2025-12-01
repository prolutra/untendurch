import Parse from 'parse';

Parse.initialize('untendurch', '');
Parse.serverURL =
  import.meta.env.VITE_REACT_APP_PARSE_SERVER_URL ||
  'http://localhost:1337/parse';

export default Parse;
