import React from "react";
import "../App.css";
import "./app.jsx";
import { useState, useEffect, useCallback } from "react";
import GaleryModal from "./Galerymodal";
import MainpicModal from "./MainpicModal";
import { Link } from "react-router-dom";
import axios from "axios";

// Galery page component
export function Galery() {
  return (
    <div className="galery-page">
      <div>
        <GaleryHeader></GaleryHeader>
        <GalerieContain></GalerieContain>
      </div>
    </div>
  );
}

// Galery header component
export function GaleryHeader() {
  return (
    <header>
      <div className="galery-header">
        <GaleryMenu></GaleryMenu>
      </div>
    </header>
  );
}

// Galery menu component
export function GaleryMenu() {
  return (
    <div className="galery-menu">
      <hr></hr>
      <Link className="galery-menu-item" to="/jim-debergue">
        Accueil
      </Link>
      <Link className="galery-menu-item" to="/Galery">
        Galerie
      </Link>

      <Link className="galery-menu-item" to="/Artiste">
        L'artiste
      </Link>
      <Link className="galery-menu-item" to="/Contact">
        Contact
      </Link>
      <br></br>
    </div>
  );
}

// Galery body component
export function GalerieContain() {
  const [selectedArray, setSelectedArray] = useState([]);
  const [arrays, setArrays] = useState([]);
  const [mainPic, setMainPic] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  //Lazy download
  const fetchData = useCallback(
    async (pageNum) => {
      if (loading || !hasMore) return;

      setLoading(true);
      try {
        const response = await axios.get(
          process.env.REACT_APP_BACK_ARRAYS,
          {
            params: {
              $sort: {
                order: -1,
              },
              $limit: 10,
              $skip: (pageNum - 1) * 10,
              $select: [
                "id",
                "name",
                "dimension",
                "imagecompressed",
                "image2compressed",
              ],
            },
            mode: "cors",
          }
        );
        const data = response.data;

        if (data.length === 0) {
          setHasMore(false);
        } else {
          setArrays((prevArrays) => [...prevArrays, ...data]);
          setPage(pageNum + 1);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données : ", error);
      } finally {
        setLoading(false);
      }
    },
    [loading, hasMore]
  );
// Arrays download
  useEffect(() => {
    fetchData(page);
  }, [fetchData, page]);

  // Opening modal for Array-details
  const [isModalOpen, setModalOpen] = useState(false);

  const openModal = (arrayId) => {
    fetchSelectedArray(arrayId);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedArray([]);
    setMainPic("");
    setModalOpen(false);
  };

  // Set selected array for details

  const fetchSelectedArray = async (arrayId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACK_ARRAYS}/${arrayId}`,
        {
          params: {
            $select: [
              "id",
              "name",
              "description",
              "dimension",
              "year",
              "image",
              "image2",
              "image3",
              "image4",
            ],
          },
          mode: "cors",
        }
      );
      const arrayData = response.data;
      setSelectedArray(arrayData);
      setMainPic(arrayData.image);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des données du tableau sélectionné : ",
        error
      );
    }
  };

  // Select array function
  const handleClick = (array) => {
    fetchSelectedArray(array.id);
    openModal();
  };

  return (
    <div className="galery-page">
      <p className="galery-title">Galerie</p>
      <div className="galery">
        {arrays.map((array) => (
          <div className="array" key={array.id}>
            <div
              className="fondu"
              value={array}
              onClick={() => {
                handleClick(array);
                openModal();
              }}
            >
              <img
                className="galerie-images-bas"
                src={`data:image/webp;base64,${array.image2compressed}`}
                alt={array.name}
              ></img>
              <img
                className="galerie-images-haut"
                src={`data:image/webp;base64,${array.imagecompressed}`}
                alt={array.name}
              ></img>
            </div>
            <div className="g-array-text">
              <p className="g-array-title">{array.name}</p>
              <p className="g-array-dimension">{array.dimension}</p>
              <hr></hr>
            </div>
          </div>
        ))}
      </div>
      {isModalOpen && selectedArray.id && (
        <GaleryModal isOpen={isModalOpen} onClose={closeModal}>
          <ArrayDetails array={selectedArray} mainPic={mainPic}></ArrayDetails>
        </GaleryModal>
      )}
    </div>
  );
}

export function ArrayDetails({ array, mainPic }) {
  // Opening fullscreen array main pic
  const [isModalOpen, setModalOpen] = useState(false);

  const openModal = () => {
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
  };

  // Set main pic state
  const [mainPic1, setMainPic1] = useState(mainPic);
  useEffect(() => {
    setMainPic1(mainPic);
  }, [mainPic]);
  const handleMainPic = (e) => {
    const newMainPic = e.target.getAttribute("value");
    setMainPic1(newMainPic);
  };
  return (
    <div className="array-page">
      <p className="array-title">{array.name}</p>
      <div className="array-pic">
        <img
          onClick={() => {
            openModal();
          }}
          className="array-main-pic"
          src={`data:image/webp;base64,${mainPic1}`}
          alt={array.name}
        ></img>
        <div className="array-info">
          <div className="array-description">
            <p>Année :</p>
            <p>Description :</p> {array.description}
          </div>
          <br></br>
          <div className="array-dimension">
            <p>Dimensions :</p>
            {array.dimension}
          </div>
          <hr></hr>
          <img
            src={`data:image/webp;base64,${array.image}`}
            value={array.image}
            onClick={(e) => handleMainPic(e)}
            alt={array.name}
          ></img>

          <img
            src={`data:image/webp;base64,${array.image2}`}
            value={array.image2}
            onClick={(e) => handleMainPic(e)}
            alt={array.name}
          ></img>

          <img
            src={`data:image/webp;base64,${array.image3}`}
            value={array.image3}
            onClick={(e) => handleMainPic(e)}
            alt={array.name}
          ></img>

          <img
            src={`data:image/webp;base64,${array.image4}`}
            value={array.image4}
            onClick={(e) => handleMainPic(e)}
            alt={array.name}
          ></img>
        </div>
      </div>
      <MainpicModal
        mainPic={mainPic1}
        isOpen={isModalOpen}
        onClose={closeModal}
      ></MainpicModal>
    </div>
  );
}

export default Galery;
