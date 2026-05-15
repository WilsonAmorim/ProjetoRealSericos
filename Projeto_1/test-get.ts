import axios from 'axios';

async function main() {
  try {
    const res = await axios.get('http://localhost:3000/api/os-itens/17', {
      headers: {
        Authorization: 'Bearer fake-token-if-needed' // Wait, the auth is bypassed or needs token? Let's assume we can fetch or it throws 401. If 401, I will need to query the DB directly.
      }
    });
    console.log(res.data);
  } catch (err: any) {
    console.log(err.response ? err.response.data : err.message);
  }
}

main();
