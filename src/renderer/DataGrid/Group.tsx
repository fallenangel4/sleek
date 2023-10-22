import React from 'react';
import { ListItem, Box, Button, Divider } from '@mui/material';
import { Filters, Filter } from '../../main/util';

interface Props {
  value: string;
  group: string;
  filters: Filters;
  onClick: (key: string, value: string) => void;
}

const Group: React.FC<Props> = ({
  value,
  group,
  filters,
  onClick
}) => {
  const values = value?.split(',') || [];

  return (
    <ListItem className="row group">
      {values.map((value, index) => {
        const selected = (filters[group as keyof Filters] || []).some(
          (filter: Filter) => filter.value === value.trim()
        );

        if (!value) {
          return <Divider key={index} />;
        }

        return (
          <Box
            key={index}
            className={selected ? 'selected' : ''}
            data-todotxt-attribute={group}
            data-todotxt-value={value}
          >
            <Button className='attribute' onClick={() => onClick(group, value.trim())}>
              {value.trim()}
            </Button>
          </Box>
        );
      })}
    </ListItem>
  );
};

export default Group;