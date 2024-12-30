import dotenv from 'dotenv';
import { web } from './application/web';


dotenv.config();

const PORT = process.env.PORT;


web.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
