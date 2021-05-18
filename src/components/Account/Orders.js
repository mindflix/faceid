import React from "react";
import Link from "@material-ui/core/Link";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Title from "./Title";

// Generate Order Data
function createData(id, date, name, shipTo, paymentMethod, amount) {
  return { id, date, name, shipTo, paymentMethod, amount };
}

const rows = [
  createData(
    0,
    "18 Mai, 2021",
    "Etienne Klein",
    "Math Fonda",
    1.5,
    9.5
  ),
  createData(
    1,
    "18 Mai, 2021",
    "Elon Musk",
    "Cryptomonnaie",
    4,
    121.45
  ),
  createData(
    2,
    "18 Mai, 2021",
    "Bill Gates",
    "Informatique",
    2,
    3.55
  ),
  createData(
    3,
    "18 Mai, 2021",
    "Linus Torvalds ",
    "Electronique",
    1.5,
    15.25
  ),
  createData(
    4,
    "17 Mai, 2021",
    "Stephen Hawking",
    "Physique",
    1,
    12.33
  ),
];

function preventDefault(event) {
  event.preventDefault();
}

const useStyles = makeStyles((theme) => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
}));

export default function Orders() {
  const classes = useStyles();
  return (
    <React.Fragment>
      <Title>Absents récents</Title>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Nom</TableCell>
            <TableCell>Matière</TableCell>
            <TableCell>Nombre d'heures</TableCell>
            <TableCell align="right">Absences cumulées</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.date}</TableCell>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.shipTo}</TableCell>
              <TableCell>{row.paymentMethod}</TableCell>
              <TableCell align="right">{row.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className={classes.seeMore}>
        <Link color="primary" href="#" onClick={preventDefault}>
          Voir plus
        </Link>
      </div>
    </React.Fragment>
  );
}
