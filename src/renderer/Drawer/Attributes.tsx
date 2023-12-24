import React, { useState, useEffect, useRef, KeyboardEvent, memo } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Button,
  Badge,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AirIcon from '@mui/icons-material/Air';
import { handleFilterSelect } from '../Shared';
import { withTranslation, WithTranslation } from 'react-i18next';
import { i18n } from '../Settings/LanguageSelector';
import './Attributes.scss';

const { store } = window.api;

interface Props extends WithTranslation {
  attributes: Attributes | null;
  filters: Filters | null;
  attributeMapping: { [key: string]: string };
  t: typeof i18n.t;
}

const DrawerAttributes: React.FC<Props> = memo(({
   attributes,
   filters,
   attributeMapping,
   t,
 }) => {
  const mustNotify = (items) => items.some((item) => item.notify);
  const [isCtrlKeyPressed, setIsCtrlKeyPressed] = useState(false);
  const [settings, setSettings] = useState({
    accordionOpenState: store.get('accordionOpenState'),
    isDrawerOpen: store.get('isDrawerOpen'),
  });

  const firstTabbableElementRef = useRef<HTMLDivElement | null>(null);

  const isAttributesEmpty = (attributes: Attributes | null) => {
    return !attributes || Object.values(attributes).every((attribute) => !Object.keys(attribute).length);
  };

  const handleCtrlCmdDown = (event: KeyboardEvent) => {
    if(event.ctrlKey || event.metaKey) {
      setIsCtrlKeyPressed(true);
    }
  };

  const handleCtrlCmdUp = () => {
    setIsCtrlKeyPressed(false);
  };

  const handleAccordionToggle = (index: number) => {
    setSettings((prevState) => {
      const updatedAccordionOpenState = [...prevState.accordionOpenState];
      updatedAccordionOpenState[index] = !updatedAccordionOpenState[index];
      return { ...prevState, accordionOpenState: updatedAccordionOpenState };
    });
  };

  useEffect(() => {
    store.set('accordionOpenState', settings.accordionOpenState);
  }, [settings.accordionOpenState]);

  useEffect(() => {
    const handleFocusFirstTabbableElement = () => {
      if(firstTabbableElementRef.current) {
        firstTabbableElementRef.current.focus();
      }
    };

    handleFocusFirstTabbableElement();

    document.addEventListener('keydown', handleCtrlCmdDown);
    document.addEventListener('keyup', handleCtrlCmdUp);
    window.addEventListener('focus', handleCtrlCmdUp);
    return () => {
      document.removeEventListener('keydown', handleCtrlCmdDown);
      document.removeEventListener('keyup', handleCtrlCmdUp);
      window.removeEventListener('focus', handleCtrlCmdUp);
    };
  }, []);

  return (
    <Box id="Attributes" ref={firstTabbableElementRef}>
      {isAttributesEmpty(attributes) ? (
        <Box className="placeholder">
          <AirIcon />
          <br />
          {t(`drawer.attributes.noAttributesAvailable`)}
        </Box>
      ) : (
        Object.keys(attributes).map((key, index) =>
          Object.keys(attributes[key]).length > 0 ? (
            <Accordion
              TransitionProps={{ unmountOnExit: true }}
              key={index}
              expanded={settings.accordionOpenState[index]}
              onChange={() => handleAccordionToggle(index)}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Badge variant="dot" invisible={!(key === 'due' && mustNotify(Object.values(attributes[key])))}>
                  <h3>
                    {attributeMapping[key]}
                  </h3>
                </Badge>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  {Object.keys(attributes[key]).map((value, childIndex) => {
                    const excluded = filters && filters[key]?.some(
                      (filter: any) => filter.value === value && filter.exclude
                    );
                    const selected = filters && filters[key]?.some((filter: any) => filter.value === value);
                    const disabled = attributes[key][value].count === 0;
                    const notify = (key === 'due') ? attributes[key][value].notify : false;

                    return (
                      <Box
                        key={`${key}-${value}-${childIndex}`}
                        data-todotxt-attribute={key}
                        data-todotxt-value={value}
                        className={`filter${isCtrlKeyPressed ? ' hide' : ''} ${
                          selected ? 'selected' : ''
                        } ${excluded ? 'excluded' : ''}`}
                      >
                        <Badge badgeContent={attributes[key][value].count} className={notify ? 'notify' : null }>
                          <Button
                            className="attribute"
                            onClick={
                              disabled
                                ? undefined
                                : () =>
                                  handleFilterSelect(key, value, filters, isCtrlKeyPressed)
                            }
                            disabled={disabled}
                          >
                            {value}
                          </Button>
                        </Badge>
                        {(isCtrlKeyPressed || excluded) && (
                          <Box
                            data-todotxt-attribute={key}
                            data-todotxt-value={value}
                            className="overlay"
                            onClick={() => handleFilterSelect(key, value, filters, isCtrlKeyPressed)}
                          >
                            <VisibilityOffIcon />
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              </AccordionDetails>
            </Accordion>
          ) : null
        )
      )}
    </Box>
  );
});

export default withTranslation()(DrawerAttributes);
