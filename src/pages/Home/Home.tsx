import Banner from '../../components/Banner/Banner';
import styles from './Home.module.scss';
import Courses from '#/src/components/Courses/Courses';
import SpecialRanking from '#/src/components/SpecialRanking/SpecialRanking';
import StartJourney from '#/src/components/StartJourney/StartJourney';

function Home(): JSX.Element {
  return (
    <div className={styles.home}>
      <main className={styles.main}>
        <Banner />
        <Courses />
        <SpecialRanking />
        <StartJourney />
      </main>
    </div>
  );
}

export default Home;
